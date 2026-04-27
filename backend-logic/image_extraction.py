import easyocr

reader = easyocr.Reader(['en'])
print("IMAGE ENDPOINT LOADED")
def extract_text_from_image(path):
    result = reader.readtext(path, detail=0)
    return " ".join(result)
