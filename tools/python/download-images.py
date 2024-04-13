import requests
import pandas
from PIL import Image
from io import BytesIO

sheet_url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUv6PC5hC4-VXzQy75DBeywJaiQjU7MPGOoZBat9iJCmQo9Pf0nc2nvAFDfRJmP06WHJEls4RgUw6/pub?gid=1173866196&single=true&output=csv'

df = pandas.read_csv(sheet_url)

print(df[:4])

urls = []

# Iterate over the list of URLs
for i in range(len(df)):

    url = df.loc[i, 'logo']
    id_ = df.loc[i, 'id']

    if url.startswith('logos'):
        urls.append(url)
        continue

    if url.startswith('data'):
        urls.append(url)
        continue

    extension = url.split('.')[-1]
    extensions = ['png', 'jpeg', 'jpg', 'svg', 'webp']
    if extension not in extensions:
        for ext in extensions:
            if ext in url:
                extension = ext
    if extension not in extensions:
        print('no extension detected for', id_, url)
        extension = 'png'
        new_url = f'sus-logos/{id_}.{extension}'
    else:
        new_url = f'logos/{id_}.{extension}'

    urls.append(new_url)

    # Download the image
    response = requests.get(url)

    with open(new_url, 'wb') as f:
        f.write(response.content)

    ## Open the image as a PIL Image object
    #image = Image.open(BytesIO(response.content))

    ## Convert the white color to alpha
    #image = image.convert("RGBA")
    #pixdata = image.load()

    #for y in range(image.size[1]):
    #    for x in range(image.size[0]):
    #            if pixdata[x, y] == (255, 255, 255, 255):
    #                        pixdata[x, y] = (255, 255, 255, 0)

    ## Save the image
    #image.save(f"logos-white-to-alpha/{id_}.png", "PNG")
with open('urls.txt', 'w') as f:
    f.write('\n'.join(urls))
