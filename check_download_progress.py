# -*- coding: utf-8 -*-
"""
检查下载进度
"""
import os
import glob
from datetime import datetime

def check_progress(folder_path, expected_count=None):
    """检查下载进度"""
    if not os.path.exists(folder_path):
        print(f"[ERROR] 文件夹不存在: {folder_path}")
        return
    
    # 统计CSV文件数量
    csv_files = glob.glob(os.path.join(folder_path, "price_*.csv"))
    current_count = len(csv_files)
    
    print(f"\n文件夹: {os.path.basename(folder_path)}")
    print(f"路径: {folder_path}")
    print(f"当前文件数: {current_count}")
    
    if expected_count:
        print(f"预期文件数: {expected_count}")
        progress = (current_count / expected_count) * 100 if expected_count > 0 else 0
        print(f"完成进度: {progress:.2f}%")
        remaining = expected_count - current_count
        print(f"剩余文件: {remaining}")
        
        # 估算剩余时间（假设每个文件需要0.5秒）
        if current_count > 0:
            # 假设从开始到现在已经下载了current_count个文件
            # 但实际需要考虑有些可能失败，所以只做粗略估算
            print(f"\n注意: 实际下载时间取决于网络速度和API响应")
    
    # 显示最新的几个文件
    if csv_files:
        # 按修改时间排序
        csv_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        print(f"\n最新下载的5个文件:")
        for i, file in enumerate(csv_files[:5], 1):
            file_name = os.path.basename(file)
            mtime = datetime.fromtimestamp(os.path.getmtime(file))
            file_size = os.path.getsize(file) / 1024  # KB
            print(f"  {i}. {file_name} ({file_size:.2f} KB, {mtime.strftime('%H:%M:%S')})")
    
    # 统计文件总大小
    total_size = sum(os.path.getsize(f) for f in csv_files) / (1024 * 1024)  # MB
    print(f"\n总数据大小: {total_size:.2f} MB")
    
    return current_count

def main():
    print("=" * 60)
    print("下载进度监控")
    print("=" * 60)
    print(f"当前时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # SH市场
    sh_path = r"C:\Program Files\work4\datas\bishe\bishe\SH"
    sh_10years_path = sh_path + "_10years"
    
    # 从原始文件夹获取预期文件数
    if os.path.exists(sh_path):
        original_files = glob.glob(os.path.join(sh_path, "price_*.csv"))
        expected_sh = len(original_files)
    else:
        expected_sh = 24609  # 之前看到的数量
    
    print("\n" + "=" * 60)
    print("SH市场进度:")
    print("=" * 60)
    current_sh = check_progress(sh_10years_path, expected_sh)
    
    # SZ市场
    sz_path = r"C:\Program Files\work4\datas\bishe\bishe\SZ"
    sz_10years_path = sz_path + "_10years"
    
    if os.path.exists(sz_path):
        original_files = glob.glob(os.path.join(sz_path, "price_*.csv"))
        expected_sz = len(original_files)
    else:
        expected_sz = 22279  # 之前看到的数量
    
    print("\n" + "=" * 60)
    print("SZ市场进度:")
    print("=" * 60)
    current_sz = check_progress(sz_10years_path, expected_sz)
    
    # 总进度
    print("\n" + "=" * 60)
    print("总进度汇总:")
    print("=" * 60)
    total_expected = expected_sh + expected_sz
    total_current = (current_sh or 0) + (current_sz or 0)
    total_progress = (total_current / total_expected * 100) if total_expected > 0 else 0
    
    print(f"总预期文件数: {total_expected:,}")
    print(f"总已下载文件数: {total_current:,}")
    print(f"总完成进度: {total_progress:.2f}%")
    print("=" * 60)

if __name__ == "__main__":
    main()


