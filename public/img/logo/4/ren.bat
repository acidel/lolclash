@echo off
Setlocal enabledelayedexpansion

Set "Pattern= "
Set "Replace=-"

For %%# in ("C:\Users\Pius\Desktop\lologos\240x185\*.png") Do (
    Set "File=%%~nx#"
    Ren "%%#" "!File:%Pattern%=%Replace%!"
)

Pause&Exit