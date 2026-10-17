// C port of k0fast.k0 (literal transliteration). usage: k0c <128-byte in hex> <16-byte key hex> -> 128-byte out hex
#include <stdint.h>
#include <stdio.h>
#include <string.h>
typedef uint32_t u;
static u rot(u x, u n){ n%=32; return n? (x<<n)|(x>>(32-n)) : x; }
static u h130(u a,u b){ u t=((((a&b)<<1)^0xffffffffu)+1); u v550=(a+b)|t; u v560=(a+b)&t; return v550-(v560^0xffffffffu)+0xffffffffu; }
static u h170(u a,u b){ u x=a^b, s=(a&b)<<1; u p=x|s, q=x&s; u v601=(p|q)|(p&q); u v636=p&q; return v601-(v636^0xffffffffu)-1; }
static u bs(u x){ return (x>>24)|((x>>8)&0xff00)|((x<<8)&0xff0000)|(x<<24); }
static u h351(u a,u b,u c){
  u v846=rot(h130(a,2779096485u+c*73244475u),(b+c)%31+1);
  u v847=h170(a|1831565813u, rot(v846^(b*2654435761u),(c*3+5)%31+1));
  return h130(h170(v846,v847), bs(v846^3282421852u));
}
static u h293(u p0,u p1,u p2,u p3,u p4){
  u v646=h130(p0&p1,(~p0)&p2);
  u v647=(p0&p1)|((p0^p1)&p2);
  u v652=2654435761u*(p4+1);
  u v653=h130(h130(v652,(p3+1)*2135587861u), rot(p2,(p4+p3)%19+1));
  u v654=v653; (void)h351(v653^p0,p3,p4);
  u v655=h170(h170(p0,rot(p1,(p3+p4)%13+5)),v654);
  u v656=v655;
  v656=h130(v656,rot(v646,(p3*7+p4)%23+1));
  u v657=h130(h130(2246822507u,(p4+1)*16843009u),p3*461845907u)|1;
  u v658=v656*v657;
  u v660=h130(v658, bs(h130(v647,rot(p2,(p3*3+p4)%29+1))));
  u v661=h170(rot(v660,(p3*11+p4*5)%31+1), h130(v646,v647)*668265261u);
  return v661;
}
static void k0(const u *in,const u *k,u *out){
  static u sh[26][32]; u v67=h130(k[0],2779096485u);
  for(u i=0;i<26;i++){ u v71=2654435761u*(i+1);
    for(u j=0;j<32;j++){ u t=h170(h170(v67,k[(j+i)&3]),v71); v67=rot(t,(j*5+i*3)%31+1);
      v67=h130(v67,rot(k[(j*3+1)&3],(j+i)%29+1)); sh[i][j]=v67; } }
  u a[32],v79,v80,v81[32],v82[32],v83[32],v84[32],v85,v86[32],v87[32],t356[32],v88,v89[32],v90[32],v91[32],t415[32],v92,v93[32],v94[32],v95[32],v96[32],tmp[32];
  memcpy(a,in,128);
  for(u r=0;r<26;r++){
    for(u l=0;l<32;l++){ v79=a[(l+31)&31]; v80=a[(l+1)&31]; v81[l]=h130(v79,sh[r][(l+3)&31]); v82[l]=h170(v80,sh[r][(l+11)&31]); }
    for(u l=0;l<32;l++) v83[l]=h293(h170(a[l],sh[r][l]),v81[l],v82[l],l,r);
    for(u l=0;l<32;l++) v84[l]=h293(v82[l],v83[l],v81[l],(l^13)&31,r);
    for(u l=0;l<32;l++) a[l]=v83[l];
    for(u l=0;l<32;l++){ v85=a[(l+7)&31]; v86[l]=h130(h130(a[l]>>3,rot(v85,(r+l)%11+1)),h170(r*40503u,l))&31; }
    for(u l=0;l<32;l++) v87[l]=a[v86[l]];
    for(u l=0;l<32;l++) t356[l]=h130(v87[l],h351(a[l],l,r));
    for(u l=0;l<32;l++){ v88=t356[(v86[l]^9)&31]; (void)v88; }
    for(u l=0;l<32;l++) v89[l]=h130(a[l],rot(v87[l],(r+l)%17+1));
    for(u l=0;l<32;l++) v90[l]=(h170(h170(v89[l],rot(v87[l],(l*5+r)%23+1)),l*11+r*17)>>2)&31;
    for(u l=0;l<32;l++) v91[l]=v89[v90[l]];
    for(u l=0;l<32;l++){ t415[l]=h130(v91[l],h351(v91[l],l,r)); }
    for(u l=0;l<32;l++){ v92=t415[(v90[l]^17)&31]; (void)v92; }
    for(u l=0;l<32;l++) v93[l]=h293(v89[l],v91[l],v87[(l*5+r)&31],l,r);
    for(u l=0;l<32;l++) v94[l]=h293(v91[l],v89[l],v91[(l*3+r)&31],l^5,r);
    for(u l=0;l<32;l++) a[l]=v93[l];
    memcpy(v95,a,128); memcpy(v96,a,128);
    for(u m=16;m;m>>=1){ for(u l=0;l<32;l++) tmp[l]=h130(v95[l],v95[l^m]); memcpy(v95,tmp,128); }
    for(u m=16;m;m>>=1){ for(u l=0;l<32;l++) tmp[l]=h170(v96[l],v96[l^m]); memcpy(v96,tmp,128); }
    for(u l=0;l<32;l++) a[l]=h130(h170(a[l],rot(v95[l],(r*2+l)%31)),rot(v96[l],(r*3+l*7)%31+1));
  }
  memcpy(out,a,128);
}
static void hx(const char*s,unsigned char*b,int n){ for(int i=0;i<n;i++) sscanf(s+2*i,"%2hhx",b+i); }
int main(int c,char**v){ u in[32],k[4],out[32]; hx(v[1],(unsigned char*)in,128); hx(v[2],(unsigned char*)k,16);
  k0(in,k,out); for(int i=0;i<128;i++) printf("%02x",((unsigned char*)out)[i]); printf("\n"); return 0; }
