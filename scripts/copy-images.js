import fs from 'fs';
import path from 'path';

// Function to ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to copy file
function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

// Function to get all image files from a directory
function getImageFiles(dirPath) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  const files = [];
  
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (imageExtensions.includes(ext)) {
        files.push(itemPath);
      }
    }
  }
  
  return files;
}

// Function to clean old images
function cleanOldImages() {
  const publicBlogsDir = path.join(process.cwd(), 'public', 'blogs');
  if (fs.existsSync(publicBlogsDir)) {
    fs.rmSync(publicBlogsDir, { recursive: true, force: true });
  }
}

// Main function to copy blog images
function copyBlogImages() {
  const contentDir = path.join(process.cwd(), 'content', 'blogs');
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('🖼️  Copying blog images...');
  
  if (!fs.existsSync(contentDir)) {
    console.log('❌ Content/blogs directory not found');
    return;
  }
  
  // Clean old images first
  cleanOldImages();
  
  // Get all blog directories
  const blogDirs = fs.readdirSync(contentDir).filter(item => {
    const itemPath = path.join(contentDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  let totalCopied = 0;
  
  for (const blogDir of blogDirs) {
    const blogPath = path.join(contentDir, blogDir);
    const imageFiles = getImageFiles(blogPath);
    
    for (const imageFile of imageFiles) {
      const fileName = path.basename(imageFile);
      const destPath = path.join(publicDir, 'blogs', blogDir, fileName);
      
      copyFile(imageFile, destPath);
      console.log(`✅ Copied: ${path.relative(process.cwd(), imageFile)} → ${path.relative(process.cwd(), destPath)}`);
      totalCopied++;
    }
  }
  
  console.log(`🎉 Successfully copied ${totalCopied} images`);
}

// Watch mode for development
function watchImages() {
  const contentDir = path.join(process.cwd(), 'content', 'blogs');
  
  if (!fs.existsSync(contentDir)) {
    console.log('❌ Content/blogs directory not found');
    return;
  }
  
  console.log('👀 Watching for image changes...');
  
  // Initial copy
  copyBlogImages();
  
  // Watch for changes
  fs.watch(contentDir, { recursive: true }, (eventType, filename) => {
    if (filename && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(filename)) {
      console.log(`📸 Image changed: ${filename}`);
      setTimeout(() => copyBlogImages(), 100); // Debounce
    }
  });
}

// Check if we should watch or just copy once
const shouldWatch = process.argv.includes('--watch');

if (shouldWatch) {
  watchImages();
} else {
  copyBlogImages();
}
