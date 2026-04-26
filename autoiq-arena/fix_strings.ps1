$file = 'src\data\cars.ts'
$content = Get-Content $file -Raw
# Fix the MG ZS EV broken features line
$old = "features: ['10.1`"" + " Infotainment`"" + ", 'Wireless Charging', 'i-Smart AI', 'AC & DC Charging`"" + ","
$new = "features: ['10.1`"" + " Infotainment', 'Wireless Charging', 'i-Smart AI', 'AC and DC Charging',"
$content = $content.Replace($old, $new)
Set-Content $file $content -NoNewline
Write-Host "Done"
