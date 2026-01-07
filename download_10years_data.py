# -*- coding: utf-8 -*-
"""
下载近十年的股票历史数据
使用 akshare 获取中国A股数据
"""

import pandas as pd
import os
import time
from datetime import datetime, timedelta
import glob

def get_stock_list_from_folder(folder_path):
    """从现有文件夹中提取股票代码列表"""
    csv_files = glob.glob(os.path.join(folder_path, "price_*.csv"))
    stock_codes = []
    for file in csv_files:
        filename = os.path.basename(file)
        # 提取股票代码：price_000001.csv -> 000001
        code = filename.replace("price_", "").replace(".csv", "")
        stock_codes.append(code)
    return sorted(set(stock_codes))

def download_stock_data_10years(code, market="SH", output_folder=None, start_date=None):
    """
    下载单只股票的近十年数据
    
    参数:
        code: 股票代码，如 '000001'
        market: 市场类型，'SH'（上海）或 'SZ'（深圳）
        output_folder: 输出文件夹路径
        start_date: 开始日期，格式 'YYYYMMDD'，默认10年前
    """
    try:
        import akshare as ak
        
        # 如果没有指定开始日期，默认10年前
        if start_date is None:
            start_date = (datetime.now() - timedelta(days=365*10)).strftime('%Y%m%d')
        end_date = datetime.now().strftime('%Y%m%d')
        
        print(f"正在下载 {code} 的数据 ({start_date} 到 {end_date})...")
        
        # 获取股票历史数据
        # 注意：需要判断是上海还是深圳
        # 上海股票：6开头，深圳股票：0或3开头
        try:
            data = ak.stock_zh_a_hist(symbol=code, period="daily", 
                                       start_date=start_date, end_date=end_date, adjust="")
        except Exception as e:
            print(f"  [ERROR] {code} 下载失败: {e}")
            return None
        
        if data is None or data.empty:
            print(f"  [WARN] {code} 没有数据")
            return None
        
        # 转换列名以匹配现有格式
        # akshare返回的列名可能是中文，需要转换
        column_mapping = {
            '日期': 'timetag',
            '开盘': 'open',
            '收盘': 'close',
            '最高': 'high',
            '最低': 'low',
            '成交量': 'volumn',
            '成交额': 'amount',
            '振幅': 'amplitude',
            '涨跌幅': 'change_pct',
            '涨跌额': 'change',
            '换手率': 'turnover'
        }
        
        # 重命名列
        for old_col, new_col in column_mapping.items():
            if old_col in data.columns:
                data = data.rename(columns={old_col: new_col})
        
        # 转换日期格式：YYYY-MM-DD -> YYYYMMDD (整数)
        if 'timetag' in data.columns:
            data['timetag'] = pd.to_datetime(data['timetag']).dt.strftime('%Y%m%d').astype(int)
        
        # 确保列的顺序与现有格式完全一致
        # 现有格式：timetag, open, high, low, close, volumn, amount, open_ineterst
        expected_columns = ['timetag', 'open', 'high', 'low', 'close', 'volumn', 'amount', 'open_ineterst']
        
        # 检查并添加缺失的列
        for col in expected_columns:
            if col not in data.columns:
                if col == 'open_ineterst':
                    # 持仓量字段，如果不存在则设为0
                    data[col] = 0.0
                else:
                    # 其他缺失列设为None
                    data[col] = None
        
        # 按照现有格式的列顺序重新排列
        data = data[expected_columns]
        
        # 确保数据类型匹配
        data['timetag'] = data['timetag'].astype(int)
        for col in ['open', 'high', 'low', 'close', 'volumn', 'amount', 'open_ineterst']:
            if col in data.columns:
                data[col] = pd.to_numeric(data[col], errors='coerce').fillna(0.0).astype(float)
        
        # 保存文件
        if output_folder:
            os.makedirs(output_folder, exist_ok=True)
            output_file = os.path.join(output_folder, f"price_{code}.csv")
            data.to_csv(output_file, index=False, encoding='utf-8-sig')
            print(f"  [OK] {code} 已保存: {len(data)} 条数据 -> {output_file}")
        
        return data
        
    except ImportError:
        print("[ERROR] 请先安装 akshare: pip install akshare")
        return None
    except Exception as e:
        print(f"  [ERROR] {code} 下载失败: {e}")
        return None

def batch_download_10years(market_folder, output_folder=None, limit=None, delay=0.5):
    """
    批量下载文件夹中所有股票的近十年数据
    
    参数:
        market_folder: 现有数据文件夹路径
        output_folder: 输出文件夹路径（如果为None，则覆盖原文件夹）
        limit: 限制下载数量（用于测试，None表示下载全部）
        delay: 每次下载之间的延迟（秒），避免请求过快
    """
    if output_folder is None:
        output_folder = market_folder
    
    # 获取股票代码列表
    print(f"\n正在扫描 {market_folder} 中的股票代码...")
    stock_codes = get_stock_list_from_folder(market_folder)
    print(f"找到 {len(stock_codes)} 只股票")
    
    if limit:
        stock_codes = stock_codes[:limit]
        print(f"限制下载前 {limit} 只股票（测试模式）")
    
    print(f"\n开始下载数据（输出到: {output_folder}）...")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    total_rows = 0
    
    for idx, code in enumerate(stock_codes, 1):
        print(f"\n[{idx}/{len(stock_codes)}] 股票代码: {code}")
        data = download_stock_data_10years(code, output_folder=output_folder)
        
        if data is not None and not data.empty:
            success_count += 1
            total_rows += len(data)
        else:
            fail_count += 1
        
        # 延迟以避免请求过快
        if idx < len(stock_codes) and delay > 0:
            time.sleep(delay)
        
        # 每10个股票显示一次进度
        if idx % 10 == 0:
            print(f"\n进度: {idx}/{len(stock_codes)} | 成功: {success_count} | 失败: {fail_count}")
    
    print("\n" + "=" * 60)
    print("下载完成!")
    print(f"  成功: {success_count} 只股票")
    print(f"  失败: {fail_count} 只股票")
    print(f"  总数据行数: {total_rows:,}")
    print(f"  输出文件夹: {output_folder}")

def test_download_single(code="000001", market="SH"):
    """测试下载单只股票数据"""
    print(f"\n[测试] 下载 {code} 的数据...")
    test_folder = "./test_download"
    os.makedirs(test_folder, exist_ok=True)
    
    data = download_stock_data_10years(code, market=market, output_folder=test_folder)
    
    if data is not None:
        print(f"\n[测试成功] 数据格式:")
        print(f"  列名: {data.columns.tolist()}")
        print(f"  数据形状: {data.shape}")
        print(f"  前3行数据:")
        print(data.head(3))
        
        # 检查格式是否匹配
        expected_cols = ['timetag', 'open', 'high', 'low', 'close', 'volumn', 'amount', 'open_ineterst']
        if list(data.columns) == expected_cols:
            print(f"\n[OK] 数据格式完全匹配!")
        else:
            print(f"\n[WARN] 数据格式不匹配")
            print(f"  期望: {expected_cols}")
            print(f"  实际: {data.columns.tolist()}")
    else:
        print("\n[测试失败] 无法下载数据")

def main():
    """主函数"""
    print("=" * 60)
    print("批量下载近十年股票历史数据")
    print("=" * 60)
    
    # 检查是否安装了akshare
    try:
        import akshare as ak
        print("[OK] akshare 已安装")
    except ImportError:
        print("[ERROR] 请先安装 akshare")
        print("安装命令: .\\.venv\\Scripts\\python.exe -m pip install akshare")
        return
    
    # 设置路径
    sh_path = r"C:\Program Files\work4\datas\bishe\bishe\SH"
    sz_path = r"C:\Program Files\work4\datas\bishe\bishe\SZ"
    
    # 可以选择备份原数据到新文件夹，或者直接覆盖
    # 这里建议先备份，然后再下载
    backup_sh = sh_path + "_10years"
    backup_sz = sz_path + "_10years"
    
    print("\n请选择操作:")
    print("0. 测试下载（单只股票，验证格式）")
    print("1. 下载SH市场数据（测试模式，前5只股票）")
    print("2. 下载SH市场数据（完整模式，所有股票）")
    print("3. 下载SZ市场数据（测试模式，前5只股票）")
    print("4. 下载SZ市场数据（完整模式，所有股票）")
    print("5. 下载两个市场的数据（完整模式）")
    
    choice = input("\n请输入选项 (0-5，直接回车默认为0): ").strip()
    if not choice:
        choice = "0"
    
    try:
        if choice == "0":
            print("\n[测试模式] 测试下载单只股票数据...")
            test_code = input("请输入股票代码（直接回车默认000001）: ").strip()
            if not test_code:
                test_code = "000001"
            test_download_single(test_code, market="SH")
        elif choice == "1":
            print("\n[测试模式] 下载SH市场前5只股票...")
            batch_download_10years(sh_path, output_folder=backup_sh, limit=5, delay=0.5)
        elif choice == "2":
            print("\n[完整模式] 下载SH市场所有股票数据...")
            print("注意：这可能需要3-4小时，请确保网络稳定")
            batch_download_10years(sh_path, output_folder=backup_sh, limit=None, delay=0.5)
        elif choice == "3":
            print("\n[测试模式] 下载SZ市场前5只股票...")
            batch_download_10years(sz_path, output_folder=backup_sz, limit=5, delay=0.5)
        elif choice == "4":
            confirm = input("确认下载SZ市场所有股票数据？这可能需要很长时间 (y/n): ")
            if confirm.lower() == 'y':
                batch_download_10years(sz_path, output_folder=backup_sz, limit=None, delay=0.5)
        elif choice == "5":
            confirm = input("确认下载两个市场所有股票数据？这可能需要很长时间 (y/n): ")
            if confirm.lower() == 'y':
                batch_download_10years(sh_path, output_folder=backup_sh, limit=None, delay=0.5)
                print("\n" + "=" * 60)
                batch_download_10years(sz_path, output_folder=backup_sz, limit=None, delay=0.5)
        else:
            print("无效选项")
    except KeyboardInterrupt:
        print("\n\n用户中断下载")
    except Exception as e:
        print(f"\n[ERROR] 发生错误: {e}")

if __name__ == "__main__":
    import sys
    
    # 如果提供了命令行参数，直接运行对应选项
    if len(sys.argv) > 1:
        choice = sys.argv[1]
        sh_path = r"C:\Program Files\work4\datas\bishe\bishe\SH"
        backup_sh = sh_path + "_10years"
        
        if choice == "0":
            test_code = sys.argv[2] if len(sys.argv) > 2 else "000001"
            test_download_single(test_code, market="SH")
        elif choice == "1":
            print("\n[测试模式] 下载SH市场前5只股票...")
            batch_download_10years(sh_path, output_folder=backup_sh, limit=5, delay=0.5)
        elif choice == "2":
            print("\n[完整模式] 下载SH市场所有股票数据...")
            print("注意：这可能需要3-4小时，请确保网络稳定")
            batch_download_10years(sh_path, output_folder=backup_sh, limit=None, delay=0.5)
        elif choice == "01":  # 同时运行0和1
            print("[执行选项0和1]\n")
            print("="*60)
            print("步骤1: 测试下载单只股票")
            print("="*60)
            test_download_single("000001", market="SH")
            print("\n" + "="*60)
            print("步骤2: 下载SH市场前5只股票")
            print("="*60)
            batch_download_10years(sh_path, output_folder=backup_sh, limit=5, delay=0.5)
        else:
            main()
    else:
        main()

