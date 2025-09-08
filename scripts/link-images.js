import fs from 'fs';
import path from 'path';

// Function to create symbolic links for blog directories
function createSymbolicLinks() {
  const contentDir = path.join(process.cwd(), 'content', 'blogs');
  const publicBlogsDir = path.join(process.cwd(), 'public', 'blogs');
  
  console.log('🔗 Creating symbolic links for blog images...');
  
  if (!fs.existsSync(contentDir)) {
    console.log('❌ Content/blogs directory not found');
    return;
  }
  
  // Ensure public/blogs directory exists
  if (!fs.existsSync(publicBlogsDir)) {
    fs.mkdirSync(publicBlogsDir, { recursive: true });
  }

  // Clean up any orphaned symlinks first
  const existingItems = fs.readdirSync(publicBlogsDir);
  for (const item of existingItems) {
    const itemPath = path.join(publicBlogsDir, item);
    try {
      if (fs.lstatSync(itemPath).isSymbolicLink()) {
        const targetPath = fs.readlinkSync(itemPath);
        const absoluteTarget = path.isAbsolute(targetPath) ? targetPath : path.join(path.dirname(itemPath), targetPath);
        if (!fs.existsSync(absoluteTarget)) {
          console.log(`🧹 Removing orphaned symlink: ${item}`);
          fs.unlinkSync(itemPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not check symlink ${item}: ${error.message}`);
    }
  }
  
  // Get all blog directories
  const blogDirs = fs.readdirSync(contentDir).filter(item => {
    const itemPath = path.join(contentDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  let linksCreated = 0;
  
  for (const blogDir of blogDirs) {
    const sourcePath = path.join(contentDir, blogDir);
    const targetPath = path.join(publicBlogsDir, blogDir);
    
    // Remove existing link/directory if it exists
    if (fs.existsSync(targetPath)) {
      try {
        if (fs.lstatSync(targetPath).isSymbolicLink()) {
          fs.unlinkSync(targetPath);
        } else {
          fs.rmSync(targetPath, { recursive: true, force: true });
        }
      } catch (error) {
        console.warn(`⚠️  Could not remove existing ${targetPath}: ${error.message}`);
      }
    }
    
    try {
      // Create junction point on Windows, symlink on Unix
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        // Use junction for directories on Windows
        fs.symlinkSync(sourcePath, targetPath, 'junction');
      } else {
        fs.symlinkSync(sourcePath, targetPath);
      }
      
      console.log(`✅ Linked: ${path.relative(process.cwd(), sourcePath)} → ${path.relative(process.cwd(), targetPath)}`);
      linksCreated++;
    } catch (error) {
      console.error(`❌ Failed to link ${blogDir}: ${error.message}`);
      // Fallback to copying files
      console.log(`📋 Falling back to copying files for ${blogDir}...`);
      copyBlogDirectory(sourcePath, targetPath);
    }
  }
  
  console.log(`🎉 Successfully created ${linksCreated} symbolic links`);
}

// Fallback function to copy files
function copyBlogDirectory(srcDir, destDir) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const items = fs.readdirSync(srcDir);
  
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (imageExtensions.includes(ext)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`📋 Copied: ${path.relative(process.cwd(), srcPath)} → ${path.relative(process.cwd(), destPath)}`);
      }
    }
  }
}

// Run the script
createSymbolicLinks();
