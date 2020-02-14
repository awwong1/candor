# Candor

*To be unreserved, honest, with sincerity- free from prejudice or malice.*

A Hugo theme. Hugo extended support is required to due scss.

```bash
git clone https://github.com/gohugoio/hugo.git
cd hugo
go install --tags extended
```

## Site Parameters

Defined in `config.[yaml|toml|json]`, these parameters are used by the Candor theme. The defaults are provided below.

```toml
[params]
  author = "Alexander Wong"                     # str
  license = "WTFPL"                             # str
  licenseLink = ""http://www.wtfpl.net/about/"" # str

  # Math typesetting
  disableKatexJS = false  # bool (useful to disable if server rendering math)
  # str: left delim, str: right delim, str: math type (display/inline)
  katexDelimiters = [["$$", "$$", "display"], ["\\(", "\\)", "inline"]]
```


## License

[MIT](LICENSE)

```text
The MIT License (MIT)

Copyright (c) 2019 Alexander Wong

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
