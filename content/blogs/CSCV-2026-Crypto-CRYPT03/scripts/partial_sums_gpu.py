# Fast bitset version of the 6-round AES partial-sum attack (CuPy).
import sys, time, json, numpy as np, cupy as cp
exec(open('/mnt/d/WSL_Ubuntu/cscv/work/c03/sq6.py').read().split("SRC = r'''")[0])  # SBOX/INV/mul/INVMC

SRC = r'''
#define CH 32
__device__ __forceinline__ unsigned xperm(unsigned x, int m){
  if(m&1)  x=((x&0x55555555u)<<1)|((x>>1)&0x55555555u);
  if(m&2)  x=((x&0x33333333u)<<2)|((x>>2)&0x33333333u);
  if(m&4)  x=((x&0x0F0F0F0Fu)<<4)|((x>>4)&0x0F0F0F0Fu);
  if(m&8)  x=((x&0x00FF00FFu)<<8)|((x>>8)&0x00FF00FFu);
  if(m&16) x=(x<<16)|(x>>16);
  return x;
}
// acc ^= XOR over rows r of shift(row[r], U(r))   ; shift(V,u)[i] = V[i^u]
template<int MODE>
__device__ __forceinline__ void accum(const unsigned* __restrict__ rowsG, unsigned* var, unsigned acc[8],
     const unsigned char* tA, const unsigned char* tB, int tid, int kpar){
  for(int c0=0;c0<256;c0+=CH){
    for(int idx=tid; idx<CH*256; idx+=256){
      int r=idx>>8, rem=idx&255, m=rem>>3, w=rem&7;
      var[idx]=xperm(rowsG[(c0+r)*8+w], m);
    }
    __syncthreads();
    #pragma unroll 4
    for(int r=0;r<CH;r++){
      int row=c0+r; unsigned u;
      if(MODE==0) u=tA[tid ^ tB[row ^ kpar]];   // step A: tA=g0inv, tB=g1, thread=t1
      else        u=tA[row ^ tid];              // steps B/C: tA=g2/g3, thread=key byte
      const unsigned* v=&var[(r*32+(u&31))*8]; int uw=u>>5;
      #pragma unroll
      for(int w=0;w<8;w++) acc[w]^=v[w^uw];
    }
    __syncthreads();
  }
}
extern "C" {
__global__ void stepA(const unsigned* __restrict__ P, unsigned* __restrict__ A1, const unsigned char* __restrict__ G, int k1){
  extern __shared__ unsigned sm[];
  unsigned* var=sm;                       // CH*256 words
  unsigned char* g0inv=(unsigned char*)(sm+CH*256);
  unsigned char* g1=g0inv+256;
  int b=blockIdx.x, t1=threadIdx.x;
  g0inv[G[t1]]=t1; g1[t1]=G[256+t1];
  __syncthreads();
  unsigned acc[8]={0,0,0,0,0,0,0,0};
  accum<0>(P+(size_t)b*2048, var, acc, g0inv, g1, t1, k1);
  // transpose: X[t1][k0] -> Y[k0][t1]
  unsigned* X=var;  // reuse (2048 words)
  #pragma unroll
  for(int w=0;w<8;w++) X[t1*8+w]=acc[w];
  __syncthreads();
  int k0=t1;
  unsigned* dst=A1+((size_t)k0*65536+b)*8;
  int kw=k0>>5, kb=k0&31;
  for(int q=0;q<8;q++){
    unsigned o=0;
    #pragma unroll
    for(int j=0;j<32;j++) o|=((X[(q*32+j)*8+kw]>>kb)&1u)<<j;
    dst[q]=o;
  }
}
__global__ void stepB(const unsigned* __restrict__ A1, unsigned* __restrict__ A2, const unsigned char* __restrict__ G){
  extern __shared__ unsigned sm[];
  unsigned* var=sm; unsigned char* g2=(unsigned char*)(sm+CH*256);
  int bid=blockIdx.x, k0=bid>>8, v3=bid&255, k2=threadIdx.x;
  g2[k2]=G[512+k2];
  __syncthreads();
  unsigned acc[8]={0,0,0,0,0,0,0,0};
  accum<1>(A1+((size_t)k0*65536+(v3<<8))*8, var, acc, g2, 0, k2, 0);
  unsigned* dst=A2+(((size_t)k0*256+k2)*256+v3)*8;
  #pragma unroll
  for(int q=0;q<8;q++) dst[q]=acc[q];
}
// C + D. MB: 8 bits x 256 t x 8 words (bit k' of MB[b][t] = bit b of ISB[t^k'])
__global__ void stepCD(const unsigned* __restrict__ A2, unsigned* __restrict__ MASK, const unsigned char* __restrict__ G,
                       const unsigned* __restrict__ MBg, int first){
  extern __shared__ unsigned sm[];
  unsigned* var=sm; unsigned char* g3=(unsigned char*)(sm+CH*256);
  int bid=blockIdx.x, k3=threadIdx.x;
  g3[k3]=G[768+k3];
  __syncthreads();
  unsigned* m=MASK+((size_t)bid*256+k3)*8;
  unsigned old[8]; unsigned alive=0;
  #pragma unroll
  for(int q=0;q<8;q++){ old[q]= first?0xffffffffu:m[q]; alive|=old[q]; }
  unsigned acc[8]={0,0,0,0,0,0,0,0};
  accum<1>(A2+(size_t)bid*2048, var, acc, g3, 0, k3, 0);
  // load MB into shared (16384 words = 64KB) reusing sm
  for(int i=k3;i<16384;i+=256) sm[i]=MBg[i];
  __syncthreads();
  if(!alive) return;
  unsigned S[64];
  #pragma unroll
  for(int i=0;i<64;i++) S[i]=0;
  #pragma unroll
  for(int q=0;q<8;q++){
    unsigned bits=acc[q];
    while(bits){ int bt=__ffs(bits)-1; bits&=bits-1; int t=(q<<5)|bt;
      #pragma unroll
      for(int bb=0;bb<8;bb++){
        const unsigned* row=&sm[(bb*256+t)*8];
        #pragma unroll
        for(int w=0;w<8;w++) S[bb*8+w]^=row[w];
      }
    }
  }
  #pragma unroll
  for(int w=0;w<8;w++){
    unsigned z=old[w];
    #pragma unroll
    for(int bb=0;bb<8;bb++) z&=~S[bb*8+w];
    m[w]=z;
  }
}
}'''
mod = cp.RawModule(code=SRC, options=('--std=c++14',), name_expressions=None)
kA = mod.get_function('stepA'); kB = mod.get_function('stepB'); kCD = mod.get_function('stepCD')
SH_A = 32*256*4 + 512; SH_B = 32*256*4 + 256; SH_CD = 65536
for k, sh in ((kA, SH_A), (kB, SH_B), (kCD, SH_CD)):
    k.max_dynamic_shared_size_bytes = sh

def tables(row):
    a = INVMC[row]
    G = np.zeros(1024, np.uint8)
    for j in range(4):
        for x in range(256): G[256*j + x] = mul(a[j], INV[x])
    return cp.asarray(G)

def mbtable():
    MB = np.zeros((8, 256, 8), np.uint32)
    for b in range(8):
        for t in range(256):
            for kp in range(256):
                if (INV[t ^ kp] >> b) & 1: MB[b, t, kp >> 5] |= np.uint32(1 << (kp & 31))
    return cp.asarray(MB.reshape(-1))

def load_bm(path):
    return np.fromfile(path, dtype=np.uint32, offset=16)[:1 << 27]

class Attack:
    def __init__(self, paths, row=0):
        self.G = tables(row); self.MB = mbtable()
        self.host = [load_bm(p) for p in paths]
        self.P = cp.empty(1 << 27, dtype=cp.uint32)
        self.A1 = cp.empty(1 << 27, dtype=cp.uint32)
        self.A2 = cp.empty(1 << 27, dtype=cp.uint32)
        self.M = cp.empty(1 << 27, dtype=cp.uint32)
    def run_struct(self, s, k1, first):
        self.P.set(self.host[s])
        kA((65536,), (256,), (self.P, self.A1, self.G, np.int32(k1)), shared_mem=SH_A)
        kB((65536,), (256,), (self.A1, self.A2, self.G), shared_mem=SH_B)
        kCD((65536,), (256,), (self.A2, self.M, self.G, self.MB, np.int32(first)), shared_mem=SH_CD)
    def run_k1(self, k1, structs):
        for i, s in enumerate(structs): self.run_struct(s, k1, 1 if i == 0 else 0)
        cp.cuda.Device().synchronize()
    def has(self, k0, k2, k3, kp):
        return (int(self.M[((k0*256+k2)*256+k3)*8 + (kp >> 5)]) >> (kp & 31)) & 1
    def alive_frac(self):
        return float(cp.mean(cp.any(self.M.reshape(-1, 8) != 0, axis=1)))
    def survivors(self, k1):
        Mh = self.M.reshape(-1, 8)
        idx = cp.nonzero(cp.any(Mh != 0, axis=1))[0]
        if idx.size > 5000: return None
        idx = cp.asnumpy(idx); Mw = cp.asnumpy(Mh[idx]); out = []
        for i, key in enumerate(idx):
            k0, k2, k3 = int(key) >> 16, (int(key) >> 8) & 255, int(key) & 255
            for q in range(8):
                w = int(Mw[i][q])
                while w:
                    b = (w & -w).bit_length() - 1; w &= w - 1
                    out.append((k0, k1, k2, k3, q*32 + b))
        return out

if __name__ == '__main__' and sys.argv[1] == 'selftest':
    info = json.load(open('/mnt/d/WSL_Ubuntu/cscv/work/c03/local/test_key.json'))
    k6 = bytes.fromhex(info['k6']); k5 = bytes.fromhex(info['k5'])
    kk = [k6[0], k6[13], k6[10], k6[7]]
    kp = [0]*4
    for r in range(4):
        for j in range(4): kp[r] ^= mul(INVMC[r][j], k5[j])
    print('true', [hex(x) for x in kk], 'kprime', [hex(x) for x in kp])
    at = Attack(['/mnt/d/WSL_Ubuntu/cscv/work/c03/local/test.bt'])
    at.P.set(at.host[0]); cp.cuda.Device().synchronize()
    for name, f in [('A', lambda: kA((65536,), (256,), (at.P, at.A1, at.G, np.int32(kk[1])), shared_mem=SH_A)),
                    ('B', lambda: kB((65536,), (256,), (at.A1, at.A2, at.G), shared_mem=SH_B)),
                    ('CD', lambda: kCD((65536,), (256,), (at.A2, at.M, at.G, at.MB, np.int32(1)), shared_mem=SH_CD))]:
        t = time.time(); f(); cp.cuda.Device().synchronize(); print(name, round(time.time() - t, 2))
    print('true key survives:', at.has(kk[0], kk[2], kk[3], kp[0]), 'alive', at.alive_frac())
