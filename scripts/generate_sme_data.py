"""生成中文小微企业信用训练数据集。"""

from pathlib import Path
import random

import pandas as pd
from faker import Faker


INDUSTRIES = ["批发零售", "餐饮", "轻工制造", "农林牧渔", "生活服务业"]


def generate_dataset(rows: int = 400, seed: int = 42) -> pd.DataFrame:
    """生成可复现的小微企业信用数据集。"""
    random.seed(seed)
    fake = Faker("zh_CN")
    Faker.seed(seed)
    data = []

    for _ in range(rows):
        industry = random.choice(INDUSTRIES)
        year = random.randint(1, 12)
        monthly_revenue = random.randint(8, 180)
        monthly_debt = random.randint(2, 70)
        overdue_cnt = random.choices([0, 1, 2, 3], [0.7, 0.15, 0.1, 0.05])[0]
        debt_ratio = monthly_debt / monthly_revenue
        default = int(
            overdue_cnt >= 2
            or (debt_ratio > 0.6 and random.random() < 0.4)
        )
        data.append(
            {
                "企业名称": fake.company(),
                "行业": industry,
                "成立年限": year,
                "月营收(万)": monthly_revenue,
                "月负债(万)": monthly_debt,
                "历史逾期次数": overdue_cnt,
                "现金流波动率": round(random.uniform(0.1, 0.8), 2),
                "是否违约": default,
            }
        )

    return pd.DataFrame(data)


if __name__ == "__main__":
    output = Path(__file__).resolve().parents[2] / "data" / "sme_credit_data.csv"
    output.parent.mkdir(parents=True, exist_ok=True)
    generate_dataset().to_csv(output, index=False, encoding="utf-8-sig")
    print(f"✅ 小微企业信用数据集已生成：{output}")
