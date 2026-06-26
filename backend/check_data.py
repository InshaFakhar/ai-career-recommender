import pandas as pd
df = pd.read_csv('cleaned_dataset.csv')
print("Total rows:", len(df))
print("\nCareer counts:")
print(df['Career'].value_counts().head(20))