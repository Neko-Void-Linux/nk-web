# Sha256 extractor of iso on huggingface using python
Example of use:
```
curl -sSL http://nekovoid.vercel.app/sha256/shafind.py | python - https://huggingface.co/arepaconcafe/neko-base/blob/main/nekovoid-lxqt-20260813.iso
```
or:
```
curl -sSL http://nekovoid.vercel.app/sha256/read | bash -s https://huggingface.co/arepaconcafe/neko-base/blob/main/nekovoid-lxqt-20260813.iso
```
dependencies:
-python
-requests

pip install --break-system-packages requests
