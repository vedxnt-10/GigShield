import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove imports
    content = re.sub(r'import NavBar from "[^"]+NavBar";\n', '', content)
    content = re.sub(r'import SOSButton from "[^"]+SOSButton";\n', '', content)

    # Remove components
    content = re.sub(r'\s*<NavBar />', '', content)
    content = re.sub(r'\s*<SOSButton />', '', content)

    # Remove pb-24
    content = re.sub(r'\bpb-24\b', 'pb-8', content)

    # Replace max-w-2xl mx-auto and max-w-md mx-auto with max-w-7xl mx-auto
    content = re.sub(r'\bmax-w-2xl mx-auto\b', 'max-w-7xl mx-auto', content)
    content = re.sub(r'\bmax-w-md mx-auto\b', 'max-w-3xl mx-auto', content)

    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob('src/screens/*.jsx'):
    process_file(filepath)

print("Done processing screens.")
