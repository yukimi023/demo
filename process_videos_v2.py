#!/usr/bin/env python3
"""
视频处理脚本 V2
处理data_temp中的图片，生成4个视频：
1. images → surgical video (前40张)
2. images叠加masks_c → ground truth (前40张)
3. images叠加prediction → landmark detection (前40张)
4. Movie_035.mp4中部下方截取窗口 → reconstructed point cloud
"""

import os
import cv2
import numpy as np
from PIL import Image
import glob
import subprocess
import shutil

def ensure_dir(directory):
    """确保目录存在"""
    os.makedirs(directory, exist_ok=True)

def get_sorted_files(directory, extension, limit=None):
    """获取排序后的文件列表，可限制数量"""
    pattern = os.path.join(directory, f"*.{extension}")
    files = glob.glob(pattern)
    # 按文件名数字排序
    files.sort(key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))
    if limit:
        files = files[:limit]
    return files

def overlay_images(base_img_path, overlay_img_path, output_path, alpha=0.6):
    """叠加两张图片"""
    try:
        # 读取基础图片 (JPG)
        base = cv2.imread(base_img_path)
        if base is None:
            print(f"无法读取基础图片: {base_img_path}")
            return False
            
        # 读取覆盖图片 (PNG)
        overlay = cv2.imread(overlay_img_path, cv2.IMREAD_UNCHANGED)
        if overlay is None:
            print(f"无法读取覆盖图片: {overlay_img_path}")
            return False
        
        # 调整覆盖图片尺寸匹配基础图片
        if overlay.shape[:2] != base.shape[:2]:
            overlay = cv2.resize(overlay, (base.shape[1], base.shape[0]))
        
        # 如果覆盖图片有alpha通道，使用它；否则创建一个
        if overlay.shape[2] == 4:
            # 有alpha通道
            overlay_rgb = overlay[:, :, :3]
            alpha_channel = overlay[:, :, 3] / 255.0
        else:
            # 没有alpha通道，创建一个基于非黑色像素的mask
            overlay_rgb = overlay
            gray = cv2.cvtColor(overlay, cv2.COLOR_BGR2GRAY)
            alpha_channel = np.where(gray > 10, alpha, 0)  # 非黑色区域使用alpha值
        
        # 扩展alpha通道到3个维度
        alpha_channel = np.stack([alpha_channel] * 3, axis=2)
        
        # 进行alpha混合
        result = base.astype(float) * (1 - alpha_channel) + overlay_rgb.astype(float) * alpha_channel
        result = result.astype(np.uint8)
        
        # 保存结果
        cv2.imwrite(output_path, result)
        return True
        
    except Exception as e:
        print(f"叠加图片时出错: {e}")
        return False

def crop_video_window(input_video, output_video, crop_params, fps=2, duration=20):
    """从视频中截取指定窗口"""
    try:
        # 先获取视频信息
        probe_cmd = [
            'ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_streams', input_video
        ]
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"无法获取视频信息: {result.stderr}")
            return False
        
        import json
        video_info = json.loads(result.stdout)
        video_stream = next((s for s in video_info['streams'] if s['codec_type'] == 'video'), None)
        
        if not video_stream:
            print("找不到视频流")
            return False
            
        width = int(video_stream['width'])
        height = int(video_stream['height'])
        
        print(f"原视频尺寸: {width}x{height}")
        
        # 计算裁剪参数 (中部下方的小窗口，往上移动一些)
        # 窗口尺寸: 宽度的1/3，高度的1/4
        crop_width = width // 3
        crop_height = height // 4
        
        # 窗口位置: 水平居中，垂直位置再往上移动
        crop_x = (width - crop_width) // 2 + 50  # 水平居中
        crop_y = height - crop_height - height // 4  # 距离底部1/4高度（再往上移动）
        
        print(f"裁剪窗口: {crop_width}x{crop_height} at ({crop_x}, {crop_y})")
        
        # 使用ffmpeg裁剪视频，跳过前0.5秒，限制时长
        ffmpeg_cmd = [
            'ffmpeg', '-y',
            '-ss', '0.5',  # 跳过前0.5秒
            '-i', input_video,
            '-t', str(duration),  # 限制输出时长
            '-filter:v', f'crop={crop_width}:{crop_height}:{crop_x}:{crop_y}',
            '-r', str(fps),  # 设置输出帧率
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-crf', '23',
            output_video
        ]
        
        print(f"运行ffmpeg命令: {' '.join(ffmpeg_cmd)}")
        print(f"跳过前0.5秒，限制时长为{duration}秒")
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"成功创建裁剪视频: {output_video}")
            return True
        else:
            print(f"ffmpeg错误: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"裁剪视频时出错: {e}")
        return False

def create_video_from_images(image_dir, output_video, fps=2):
    """从图片目录创建视频"""
    try:
        # 获取图片列表
        image_files = get_sorted_files(image_dir, "jpg")
        if not image_files:
            print(f"在 {image_dir} 中没有找到JPG图片")
            return False
        
        print(f"找到 {len(image_files)} 张图片")
        
        # 使用ffmpeg创建视频
        ffmpeg_cmd = [
            'ffmpeg', '-y',  # -y 覆盖输出文件
            '-framerate', str(fps),
            '-pattern_type', 'glob',
            '-i', os.path.join(image_dir, '*.jpg'),
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-crf', '23',  # 质量参数
            output_video
        ]
        
        print(f"运行ffmpeg命令: {' '.join(ffmpeg_cmd)}")
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"成功创建视频: {output_video}")
            return True
        else:
            print(f"ffmpeg错误: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"创建视频时出错: {e}")
        return False

def main():
    # 定义路径
    data_dir = "data_temp"
    images_dir = os.path.join(data_dir, "images")
    masks_dir = os.path.join(data_dir, "masks_c") 
    prediction_dir = os.path.join(data_dir, "prediction")
    
    output_base = "temp_processed"
    surgical_dir = os.path.join(output_base, "surgical")
    gt_dir = os.path.join(output_base, "ground_truth")
    ld_dir = os.path.join(output_base, "landmark_detection")
    
    videos_output = "public/Videos/Demo4"
    input_movie = "Movie_035.mp4"
    
    # 创建临时输出目录
    for d in [surgical_dir, gt_dir, ld_dir, videos_output]:
        ensure_dir(d)
    
    print("开始处理图片（前40张）...")
    
    # 1. 处理surgical video (直接复制images前40张)
    print("1. 处理 Surgical Video...")
    image_files = get_sorted_files(images_dir, "jpg", limit=40)  # 限制为前40张
    for img_file in image_files:
        filename = os.path.basename(img_file)
        shutil.copy2(img_file, os.path.join(surgical_dir, filename))
    print(f"复制了 {len(image_files)} 张图片")
    
    # 2. 处理ground truth (images + masks_c，前40张)
    print("2. 处理 Ground Truth...")
    count = 0
    for img_file in image_files:  # 使用前40张
        base_name = os.path.splitext(os.path.basename(img_file))[0]
        mask_file = os.path.join(masks_dir, f"{base_name}.png")
        output_file = os.path.join(gt_dir, f"{base_name}.jpg")
        
        if os.path.exists(mask_file):
            if overlay_images(img_file, mask_file, output_file, alpha=0.4):
                count += 1
        else:
            # 如果没有对应的mask，直接复制原图
            shutil.copy2(img_file, output_file)
            count += 1
    print(f"处理了 {count} 张ground truth图片")
    
    # 3. 处理landmark detection (images + prediction，前40张)
    print("3. 处理 Landmark Detection...")
    count = 0
    for img_file in image_files:  # 使用前40张
        base_name = os.path.splitext(os.path.basename(img_file))[0]
        pred_file = os.path.join(prediction_dir, f"{base_name}.png")
        output_file = os.path.join(ld_dir, f"{base_name}.jpg")
        
        if os.path.exists(pred_file):
            if overlay_images(img_file, pred_file, output_file, alpha=0.7):
                count += 1
        else:
            # 如果没有对应的prediction，直接复制原图
            shutil.copy2(img_file, output_file)
            count += 1
    print(f"处理了 {count} 张landmark detection图片")
    
    # 生成视频
    print("\n开始生成视频...")
    
    # 前三个视频从图片生成
    image_videos = [
        (surgical_dir, os.path.join(videos_output, "surgical_video.mp4")),
        (gt_dir, os.path.join(videos_output, "ground_truth.mp4")),
        (ld_dir, os.path.join(videos_output, "landmark_detection.mp4"))
    ]
    
    for img_dir, video_path in image_videos:
        print(f"生成视频: {video_path}")
        create_video_from_images(img_dir, video_path, fps=2)
    
    # 4. 处理point cloud (从Movie_035.mp4截取窗口)
    print("4. 处理 Reconstructed Point Cloud...")
    point_cloud_video = os.path.join(videos_output, "point_cloud.mp4")
    
    if os.path.exists(input_movie):
        # 计算视频时长：40张图片，2fps = 20秒
        video_duration = len(image_files) / 2.0  # 40张图片 / 2fps = 20秒
        crop_video_window(input_movie, point_cloud_video, {}, fps=2, duration=video_duration)
    else:
        print(f"找不到输入视频: {input_movie}")
    
    # 清理临时文件
    print("\n清理临时文件...")
    shutil.rmtree(output_base)
    
    print("所有视频生成完成！")

if __name__ == "__main__":
    main() 