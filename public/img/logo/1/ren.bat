@echo off
Setlocal enabledelayedexpansion

Set "Pattern= "
Set "Replace=-"

For %%# in ("C:\Users\Pius\Desktop\lologo\New folder\3\*.png") Do (
    Set "File=%%~nx#"
    Ren "%%#" "!File:%Pattern%=%Replace%!"
)

Pause&Exit