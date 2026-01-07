# 一个完整的简单程序
def calculate_average(scores):
    """计算平均分"""
    if not scores:
        return 0
    return sum(scores) / len(scores)


def main():
    # 获取用户输入
    name = input("请输入学生姓名：")

    # 输入成绩
    scores = []
    while True:
        try:
            score = input("请输入成绩（输入q结束）：")
            if score.lower() == 'q':
                break
            scores.append(float(score))
        except ValueError:
            print("请输入有效的数字！")

    # 计算并显示结果
    if scores:
        avg = calculate_average(scores)
        print(f"{name}的平均分是：{avg:.2f}")

        # 判断等级
        if avg >= 90:
            print("优秀！")
        elif avg >= 80:
            print("良好！")
        elif avg >= 60:
            print("及格！")
        else:
            print("不及格，需要努力！")
    else:
        print("未输入任何成绩！")


if __name__ == "__main__":
    main()