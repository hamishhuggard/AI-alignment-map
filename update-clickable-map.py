# python script to create a duplicate of the 'edit' directory called the 'map' directory
# and remove the lines of code to make the icons clickable rather than editable:
to_remove = [
    "$('.map-item').draggable();",
    '/*',
    '*/',
    #'transition: all .2s ease-in-out;',
    '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>',
    '<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script>'
]

import os
import shutil

def remove_lines(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    with open(file_path, 'w') as f:
        for line in lines:
            if line.strip() not in to_remove:
                f.write(line)

def copy_dir(src, dest):
    try:
        shutil.copytree(src, dest)
    except OSError as e:
        print('Directory not copied. Error: %s' % e)

def remove_lines_from_dir(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            file_path = os.path.join(root, file)
            if is_html_css_js(file_path):
                remove_lines(file_path)

def is_html_css_js(file_path):
    return file_path.endswith('.html') or file_path.endswith('.css') or file_path.endswith('.js')

def delete_dir(dir_path):
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)

def main():
    src = './edit'
    dest = './map'
    delete_dir(dest)
    copy_dir(src, dest)
    remove_lines_from_dir(dest)

if __name__ == '__main__':
    main()
