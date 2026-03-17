import re, glob
other_files = [f for f in glob.glob('c:/Users/BOSS/deepH/cmd/deeph/*.go') if 'main.go' not in f]
funcs = set()
for f in other_files:
    funcs.update(re.findall(r'^func\s+([A-Za-z0-9_]+)\(', open(f, encoding='utf-8').read(), re.M))

funcs -= {'main', 'init'}
print("Functions to remove:", funcs)

main_path = 'c:/Users/BOSS/deepH/cmd/deeph/main.go'
lines = open(main_path, encoding='utf-8').readlines()
out = []
skip = False
for line in lines:
    if not skip:
        m = re.match(r'^func\s+([A-Za-z0-9_]+)\(', line)
        if m and m.group(1) in funcs:
            skip = True
            print("Removing struct/func:", m.group(1))
        else:
            out.append(line)
            
    if skip and line in ('}\n', '}\r\n'):
        skip = False

open(main_path, 'w', encoding='utf-8').writelines(out)
