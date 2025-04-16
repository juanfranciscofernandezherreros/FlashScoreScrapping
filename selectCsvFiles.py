import tkinter as tk
from tkinter import filedialog
import pandas as pd

def select_csv_files():
    # Create the root window (it won't be shown)
    root = tk.Tk()
    root.withdraw()  # Hide the root window

    # Open the file dialog to select multiple CSV files
    file_paths = filedialog.askopenfilenames(
        title="Select CSV files",
        filetypes=(("CSV Files", "*.csv"), ("All Files", "*.*"))
    )

    # Return the list of selected file paths
    return file_paths

def load_and_combine_csv(files):
    # List to hold all DataFrames
    data_frames = []
    
    # Loop through the selected files and read them into pandas DataFrames
    for file in files:
        df = pd.read_csv(file)
        data_frames.append(df)
    
    # Combine all DataFrames into one
    combined_df = pd.concat(data_frames, ignore_index=True)
    
    return combined_df

def main():
    # Step 1: Select multiple CSV files
    selected_files = select_csv_files()

    if selected_files:
        # Step 2: Load and combine the CSV files
        combined_data = load_and_combine_csv(selected_files)
        
        # Step 3: Display the combined data or save to a new CSV file
        print("Combined Data:")
        print(combined_data.head())  # Display the first few rows of combined data
        
        # Optionally, you can save the combined data to a new CSV file
        combined_data.to_csv("combined_output.csv", index=False)
        print("Combined CSV saved as 'combined_output.csv'")
    else:
        print("No files selected.")

if __name__ == "__main__":
    main()
