import os

def rreplace(s:str, old:str, new:str, count:int): # https://stackoverflow.com/a/59082116
    return new.join(s.rsplit(old, count))

primary = open("./index.html", mode="rt", encoding="utf-8")
primary_text = primary.read().splitlines()
primary.close()
start_end_str = {
    "start": {
        "global": "<!-- BEGIN GLOBAL HEAD -->",
        "header": "<!-- BEGIN HEADER -->",
        "footer": "<!-- BEGIN FOOTER -->"
    },
    "end": {
        "global": "<!-- END GLOBAL HEAD -->",
        "header": "<!-- END HEADER -->",
        "footer": "<!-- END FOOTER -->"
    }
}
saved:dict[str, list] = dict()
active:dict[str, bool] = dict()
if start_end_str["end"].keys() != start_end_str["start"].keys():
    raise KeyError("Start and End keys of start_end_str do not match! Further functions will fail, execution stopped.")

start_end_str_keys = list(start_end_str["end"].keys())

for key in start_end_str_keys:
    saved[key] = []
    active[key] = False

for i in range(len(primary_text)):
    text = primary_text[i]
    stripped = text.strip()
    for key in start_end_str_keys:
        # End if end
        if stripped == start_end_str["end"][key]:
            active[key] = False
        # Append if found
        if active[key]:
            saved[key].append(text)
        # Start if start
        if stripped == start_end_str["start"][key]:
            active[key] = True

for key in list(saved.keys()):
    saved[key] = "\n".join(saved[key])

def replaceContentBetweenLines(text:str, start:str, end:str, replacewith:str):
    # Replace content between two lines, which will not be removed
    text = text.splitlines()
    in_the_lines = False
    index = -1
    faulty = False
    final_text = []
    for i in range(len(text)):
        if text[i].strip() == start.strip():
            in_the_lines = True
            if index != -1:
                faulty = True
                break
            index = i+1
            final_text.append(text[i])
            final_text.append("")
        if text[i].strip() == end.strip():
            in_the_lines = False
        if in_the_lines == False:
            final_text.append(text[i])
    if faulty == True:
        return text
    if index != -1:
        final_text[index] = replacewith
    return "\n".join(final_text)

# Write the files
for root, dirs, files in os.walk(os.path.abspath("./html")):
    for name in files.copy():
        file = open(os.path.join(root, name), mode="rt", encoding="utf-8")
        text = file.read()
        file.close()
        for todo in start_end_str_keys:
            text = replaceContentBetweenLines(text, start_end_str["start"][todo], start_end_str["end"][todo], saved[todo])
        new_file_name = os.path.join(root, name + ".bak")
        new_file = open(new_file_name, mode="wt+", encoding="utf-8")
        new_file.write(text)
        new_file.close()
        os.replace(new_file_name, rreplace(new_file_name, ".bak", "", 1))
        print("wrote " + new_file_name)