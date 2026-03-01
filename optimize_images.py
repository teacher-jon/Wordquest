#!/usr/bin/env python3
"""
Image Optimization Script for WordCraft
Compresses PNG files using PIL/Pillow library
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
    print("✓ PIL/Pillow found")
except ImportError:
    print("❌ PIL/Pillow not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image
    print("✓ PIL/Pillow installed successfully")

def get_file_size(filepath):
    """Get file size in MB"""
    size_bytes = os.path.getsize(filepath)
    return size_bytes / (1024 * 1024)

def optimize_png(input_path, output_path=None, quality=85, max_size=None):
    """
    Optimize a PNG file
    
    Args:
        input_path: Path to input PNG file
        output_path: Path to output file (if None, overwrites input)
        quality: Quality level 1-100 (higher = better quality, larger file)
        max_size: Maximum dimension (width or height) to resize to
    """
    if output_path is None:
        output_path = input_path
    
    # Open image
    img = Image.open(input_path)
    original_size = get_file_size(input_path)
    
    print(f"\n📁 Processing: {input_path}")
    print(f"   Original size: {original_size:.2f} MB")
    print(f"   Dimensions: {img.size[0]}x{img.size[1]}")
    print(f"   Mode: {img.mode}")
    
    # Resize if needed
    if max_size and (img.size[0] > max_size or img.size[1] > max_size):
        ratio = min(max_size / img.size[0], max_size / img.size[1])
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        print(f"   Resized to: {new_size[0]}x{new_size[1]}")
    
    # Convert RGBA to RGB if no transparency is actually used
    if img.mode == 'RGBA':
        # Check if alpha channel is actually used
        alpha = img.split()[-1]
        if alpha.getextrema() == (255, 255):
            # No transparency, convert to RGB
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[-1])
            img = rgb_img
            print(f"   Converted to RGB (no transparency detected)")
    
    # Save with optimization
    save_kwargs = {
        'optimize': True,
        'compress_level': 9  # Maximum PNG compression
    }
    
    # For RGB images, we can also reduce colors
    if img.mode == 'RGB':
        # Convert to palette mode with optimized colors
        img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
        print(f"   Reduced to 256 colors")
    
    img.save(output_path, 'PNG', **save_kwargs)
    
    new_size = get_file_size(output_path)
    reduction = ((original_size - new_size) / original_size) * 100
    
    print(f"   ✓ Optimized size: {new_size:.2f} MB")
    print(f"   ✓ Reduction: {reduction:.1f}%")
    
    return original_size, new_size

def main():
    """Main optimization function"""
    assets_dir = Path('assets')
    
    if not assets_dir.exists():
        print("❌ Error: 'assets' directory not found!")
        print("   Make sure you run this script from the project root directory.")
        return
    
    # Files to optimize
    files_to_optimize = [
        ('tiles.png', None),  # (filename, max_dimension or None)
        ('chars.png', None),
        ('ui.png', 2048)  # Resize ui.png if larger than 2048px
    ]
    
    print("=" * 60)
    print("🎨 WordCraft Image Optimization")
    print("=" * 60)
    
    # Create backup directory
    backup_dir = assets_dir / 'backup_original'
    backup_dir.mkdir(exist_ok=True)
    print(f"\n📦 Backups will be saved to: {backup_dir}")
    
    total_original = 0
    total_optimized = 0
    
    for filename, max_size in files_to_optimize:
        input_path = assets_dir / filename
        
        if not input_path.exists():
            print(f"\n⚠️  Skipping {filename} (not found)")
            continue
        
        # Backup original
        backup_path = backup_dir / filename
        if not backup_path.exists():
            import shutil
            shutil.copy2(input_path, backup_path)
            print(f"\n💾 Backed up: {filename}")
        
        # Optimize
        try:
            orig_size, new_size = optimize_png(input_path, max_size=max_size)
            total_original += orig_size
            total_optimized += new_size
        except Exception as e:
            print(f"   ❌ Error optimizing {filename}: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 OPTIMIZATION SUMMARY")
    print("=" * 60)
    print(f"Total original size:  {total_original:.2f} MB")
    print(f"Total optimized size: {total_optimized:.2f} MB")
    print(f"Total saved:          {total_original - total_optimized:.2f} MB")
    print(f"Overall reduction:    {((total_original - total_optimized) / total_original * 100):.1f}%")
    print("\n✓ Optimization complete!")
    print(f"✓ Original files backed up to: {backup_dir}")
    print("\n💡 Test the game to ensure images look good.")
    print("   If you need to restore originals, copy them from the backup folder.")

if __name__ == '__main__':
    main()
