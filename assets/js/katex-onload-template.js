document.addEventListener("DOMContentLoaded", function(event) {
  // HUGO VARIABLE MAGIC START
  {{ $rawDelims := slice }}
  {{ range $delim_val := .Site.Params.katexDelimiters }}
    {{ $ld := index $delim_val 0 | replaceRE "([\\\\])(.*)" "\\\\${2}" }}{{ $rd := index $delim_val 1 | replaceRE "([\\\\])(.*)" "\\\\${2}" }}{{ $delim_p_str := "" }}
    {{ if eq "display" (index $delim_val 2) }}{{ $delim_p_str = printf "{left:'%s',right:'%s',display:%s}" $ld $rd "true" }}{{ else }}{{ $delim_p_str = printf "{left:'%s',right:'%s',display:%s}" $ld $rd "false" }}{{ end }}
    {{ $rawDelims = $rawDelims | append $delim_p_str}}
  {{ else }}
    {{ $rawDelims = slice "{left:'$$',right:'$$',display:true}" "{left:'\\\\(',right:'\\\\)',display:false}" }}
  {{ end }}
  const rawDelims = [{{ delimit $rawDelims "," | safeJS }}];
  // HUGO VARIABLE MAGIC END
  renderMathInElement(
    document.getElementById('markdownBody'),
    {delimiters:rawDelims}
  );
});
