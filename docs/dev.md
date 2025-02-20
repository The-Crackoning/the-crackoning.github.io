# Some nice developing things I used to create this giant ass thing

## Regex
Replace Header, Footer and Head when I had to update them on all websites. And a few other things
The first is the normal one, the one under it for VS Code cuz it's different.

Header and Footer
```regex
Normal

\<header([\s\S]*?)\<\/header\>
\<footer([\s\S]*?)\<\/footer\>


VSCode

\n{0}<header([\s\S]*?)</header>
\n{0}<footer([\s\S]*?)</footer>
```

Just the global part of Head
```regex
Normal

\<!-- BEGIN GLOBAL HEAD --\>([\s\S]*?)\<!-- END GLOBAL HEAD --\>


VSCode

\n{0}<!-- BEGIN GLOBAL HEAD -->([\s\S]*?)<!-- END GLOBAL HEAD -->
```

All of Head
```regex
Normal

\<head([\s\S]*?)\<\/head\>


VSCode

\n{0}<head([\s\S]*?)</head>
```

## Some websites I guess
- \<head\> metadata: https://ogp.me