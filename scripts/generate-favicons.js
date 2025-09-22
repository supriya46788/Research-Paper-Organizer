#!/usr/bin/env node

/**
 * Favicon Generation Script
 * Generates all required favicon sizes and formats from a source image
 * 
 * Usage: node scripts/generate-favicons.js [source-image] [output-dir]
 * Example: node scripts/generate-favicons.js logo.png favicon/
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

class FaviconGenerator {
  constructor(sourceImage, outputDir = 'favicon') {
    this.sourceImage = sourceImage;
    this.outputDir = outputDir;
    this.sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 48, name: 'favicon-48x48.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' }
    ];
  }

  async generate() {
    try {
      console.log('🎨 Starting favicon generation...');
      
      // Create output directory if it doesn't exist
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
        console.log(`📁 Created directory: ${this.outputDir}`);
      }

      // Load source image
      const sourceImage = await loadImage(this.sourceImage);
      console.log(`📸 Loaded source image: ${this.sourceImage}`);

      // Generate favicons for each size
      for (const { size, name } of this.sizes) {
        await this.generateFavicon(sourceImage, size, name);
        console.log(`✅ Generated: ${name} (${size}x${size})`);
      }

      // Generate ICO file
      await this.generateIcoFile(sourceImage);
      console.log('✅ Generated: favicon.ico');

      // Generate manifest
      await this.generateManifest();
      console.log('✅ Generated: site.webmanifest');

      // Generate browserconfig
      await this.generateBrowserConfig();
      console.log('✅ Generated: browserconfig.xml');

      console.log('🎉 Favicon generation completed successfully!');
      
    } catch (error) {
      console.error('❌ Error generating favicons:', error.message);
      process.exit(1);
    }
  }

  async generateFavicon(sourceImage, size, filename) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, size, size);

    // Calculate scaling to fit image in canvas while maintaining aspect ratio
    const scale = Math.min(size / sourceImage.width, size / sourceImage.height);
    const scaledWidth = sourceImage.width * scale;
    const scaledHeight = sourceImage.height * scale;
    
    // Center the image
    const x = (size - scaledWidth) / 2;
    const y = (size - scaledHeight) / 2;

    // Draw the image
    ctx.drawImage(sourceImage, x, y, scaledWidth, scaledHeight);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(this.outputDir, filename);
    fs.writeFileSync(outputPath, buffer);
  }

  async generateIcoFile(sourceImage) {
    // For simplicity, we'll create a 32x32 ICO file
    // In a real implementation, you might want to use a library like 'ico-convert'
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 32, 32);
    
    const scale = Math.min(32 / sourceImage.width, 32 / sourceImage.height);
    const scaledWidth = sourceImage.width * scale;
    const scaledHeight = sourceImage.height * scale;
    const x = (32 - scaledWidth) / 2;
    const y = (32 - scaledHeight) / 2;

    ctx.drawImage(sourceImage, x, y, scaledWidth, scaledHeight);

    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(this.outputDir, 'favicon.ico');
    fs.writeFileSync(outputPath, buffer);
  }

  async generateManifest() {
    const manifest = {
      name: "Research Paper Organizer",
      short_name: "RPO",
      description: "Organize, track, and manage your research papers seamlessly with AI-powered tools",
      start_url: "../",
      scope: "../",
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#ffffff",
      theme_color: "#2563eb",
      lang: "en",
      dir: "ltr",
      categories: ["education", "productivity", "research", "academic"],
      icons: this.sizes.map(({ size, name }) => ({
        src: `./${name}`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: size >= 192 ? "any maskable" : "any"
      }))
    };

    const outputPath = path.join(this.outputDir, 'site.webmanifest');
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  }

  async generateBrowserConfig() {
    const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="./favicon-48x48.png"/>
            <square150x150logo src="./android-chrome-192x192.png"/>
            <square310x310logo src="./android-chrome-512x512.png"/>
            <wide310x150logo src="./android-chrome-512x512.png"/>
            <TileColor>#2563eb</TileColor>
        </tile>
        <badge>
            <polling-uri src="./favicon-32x32.png"/>
            <frequency>30</frequency>
            <cycle>1</cycle>
        </badge>
    </msapplication>
</browserconfig>`;

    const outputPath = path.join(this.outputDir, 'browserconfig.xml');
    fs.writeFileSync(outputPath, browserConfig);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎨 Favicon Generator

Usage: node scripts/generate-favicons.js [source-image] [output-dir]

Arguments:
  source-image  Path to the source image (PNG, JPG, etc.)
  output-dir    Output directory for generated favicons (default: favicon)

Examples:
  node scripts/generate-favicons.js logo.png
  node scripts/generate-favicons.js assets/icon.png favicon/
  node scripts/generate-favicons.js ../images/brand.png ./icons/

Requirements:
  - Node.js with canvas package: npm install canvas
  - Source image should be at least 512x512 pixels for best results
    `);
    process.exit(0);
  }

  const sourceImage = args[0];
  const outputDir = args[1] || 'favicon';

  if (!fs.existsSync(sourceImage)) {
    console.error(`❌ Source image not found: ${sourceImage}`);
    process.exit(1);
  }

  const generator = new FaviconGenerator(sourceImage, outputDir);
  generator.generate();
}

module.exports = FaviconGenerator;
