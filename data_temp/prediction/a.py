import os

for filename in os.listdir('.'):
    if filename.startswith('images_'):
        new_name = filename[len('images_'):]
        os.rename(filename, new_name)