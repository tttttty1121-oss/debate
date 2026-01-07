# -*- coding: utf-8 -*-
"""显示下载文件的存放位置"""
import os

print("=" * 60)
print("数据文件存放位置")
print("=" * 60)

sh_path = r"C:\Program Files\work4\datas\bishe\bishe\SH"
sz_path = r"C:\Program Files\work4\datas\bishe\bishe\SZ"

backup_sh = sh_path + "_10years"
backup_sz = sz_path + "_10years"

print("\n原始数据文件夹:")
print(f"  SH市场: {sh_path}")
print(f"  SZ市场: {sz_path}")

print("\n十年数据下载文件夹:")
print(f"  SH市场: {backup_sh}")
print(f"  SZ市场: {backup_sz}")

print("\n注意事项:")
print("  - 十年数据会下载到新文件夹（不会覆盖原有数据）")
print("  - 文件名格式: price_股票代码.csv")
print("  - 例如: price_000001.csv, price_000002.csv 等")

# 检查文件夹是否存在
print("\n文件夹状态:")
if os.path.exists(backup_sh):
    file_count = len([f for f in os.listdir(backup_sh) if f.endswith('.csv')])
    print(f"  SH_10years: 已存在 ({file_count} 个CSV文件)")
else:
    print(f"  SH_10years: 不存在（将自动创建）")

if os.path.exists(backup_sz):
    file_count = len([f for f in os.listdir(backup_sz) if f.endswith('.csv')])
    print(f"  SZ_10years: 已存在 ({file_count} 个CSV文件)")
else:
    print(f"  SZ_10years: 不存在（将自动创建）")

print("=" * 60)


