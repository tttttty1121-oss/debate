import pandas as pd
import os
import glob

def analyze_market_data(market_folder, sample_size=5):
    """分析一个市场文件夹的数据
    
    参数:
        market_folder: 市场文件夹路径
        sample_size: 详细检查的文件数量（默认5个）
    """
    csv_files = sorted(glob.glob(os.path.join(market_folder, "price_*.csv")))
    print(f"\n{'='*60}")
    print(f"=== {os.path.basename(market_folder)} 市场数据分析 ===")
    print(f"{'='*60}")
    print(f"文件夹路径: {market_folder}")
    print(f"找到的CSV文件数量: {len(csv_files)}")
    
    if len(csv_files) == 0:
        print("[ERROR] 没有找到数据文件（price_*.csv）")
        return
    
    # 显示所有文件名（前10个）
    print(f"\n文件列表（前10个）:")
    for i, file in enumerate(csv_files[:10], 1):
        file_size = os.path.getsize(file) / 1024  # KB
        print(f"  {i}. {os.path.basename(file)} ({file_size:.2f} KB)")
    if len(csv_files) > 10:
        print(f"  ... 还有 {len(csv_files) - 10} 个文件")
    
    # 详细检查前几个文件
    valid_files = 0
    total_rows = 0
    date_range = []
    all_columns = set()
    
    check_files = csv_files[:sample_size]
    print(f"\n详细检查前 {len(check_files)} 个文件:")
    print("-" * 60)
    
    for idx, file in enumerate(check_files, 1):
        try:
            df = pd.read_csv(file, encoding='utf-8')
            
            if len(df) == 0:
                print(f"\n[{idx}] {os.path.basename(file)}: [ERROR] 文件为空")
                continue
            
            valid_files += 1
            total_rows += len(df)
            
            # 收集列名
            all_columns.update(df.columns.tolist())
            
            # 获取时间范围
            if 'timetag' in df.columns:
                min_date = df['timetag'].min()
                max_date = df['timetag'].max()
                date_range.append(min_date)
                date_range.append(max_date)
                
                print(f"\n[{idx}] {os.path.basename(file)}")
                print(f"    [OK] 数据行数: {len(df):,}")
                print(f"    [OK] 列数: {len(df.columns)}")
                print(f"    [OK] 时间范围: {min_date} 到 {max_date}")
                
                # 显示关键列的信息
                if 'close' in df.columns:
                    latest_close = df['close'].iloc[-1]
                    print(f"    [OK] 最新收盘价: {latest_close}")
                
                # 显示前几列名称
                print(f"    [OK] 列名: {', '.join(df.columns[:5].tolist())}")
                if len(df.columns) > 5:
                    print(f"      ... 还有 {len(df.columns) - 5} 列")
                    
            else:
                print(f"\n[{idx}] {os.path.basename(file)}")
                print(f"    [WARN] 未找到 'timetag' 列")
                print(f"    [OK] 数据行数: {len(df):,}")
                print(f"    [OK] 列名: {', '.join(df.columns.tolist())}")
                
        except UnicodeDecodeError:
            # 尝试其他编码
            try:
                df = pd.read_csv(file, encoding='gbk')
                print(f"\n[{idx}] {os.path.basename(file)}: [OK] 使用GBK编码成功读取")
                if len(df) > 0:
                    valid_files += 1
                    total_rows += len(df)
            except Exception as e:
                print(f"\n[{idx}] {os.path.basename(file)}: [ERROR] 读取失败 - {e}")
        except Exception as e:
            print(f"\n[{idx}] {os.path.basename(file)}: [ERROR] 读取失败 - {e}")
    
    # 统计信息
    print(f"\n{'='*60}")
    print("统计摘要:")
    print(f"  有效文件数: {valid_files}/{len(check_files)} (样本)")
    print(f"  总文件数: {len(csv_files)}")
    print(f"  样本数据总行数: {total_rows:,}")
    if date_range:
        print(f"  样本时间跨度: {min(date_range)} 到 {max(date_range)}")
    if all_columns:
        print(f"  所有列名: {', '.join(sorted(all_columns))}")

# 分析两个市场
sh_path = r"C:\Program Files\work4\datas\bishe\bishe\SH"
sz_path = r"C:\Program Files\work4\datas\bishe\bishe\SZ"

# 检查文件夹是否存在
if os.path.exists(sh_path):
    analyze_market_data(sh_path, sample_size=5)
else:
    print(f"[ERROR] 文件夹不存在: {sh_path}")

if os.path.exists(sz_path):
    analyze_market_data(sz_path, sample_size=5)
else:
    print(f"[ERROR] 文件夹不存在: {sz_path}")