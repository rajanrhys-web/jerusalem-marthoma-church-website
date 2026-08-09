Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Rhys.Rajan\.gemini\antigravity\brain\356e1402-fb45-478d-9cc8-aa40fa401833\.user_uploaded\media_1786025875788.png"
$destPath = "C:\Users\Rhys.Rajan\.gemini\antigravity\scratch\st-thomas-mar-thoma-church\assets\church_logo.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $bmp.Width
$height = $bmp.Height

$newBmp = New-Object System.Drawing.Bitmap($width, $height)

# Copy pixels and remove white background outside shield
for ($x = 0; $x -lt $width; $x++) {
    for ($y = 0; $y -lt $height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        # Check if pixel is white/near-white outside shield boundary
        if ($p.R -ge 240 -and $p.G -ge 240 -and $p.B -ge 240) {
            # Check edge distance or corners
            if ($x -lt 40 -or $x -gt ($width - 40) -or $y -lt 40 -or $y -gt ($height - 40)) {
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            } else {
                $newBmp.SetPixel($x, $y, $p)
            }
        } else {
            $newBmp.SetPixel($x, $y, $p)
        }
    }
}

$bmp.Dispose()
$newBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$newBmp.Dispose()
Write-Host "Processed logo saved successfully"
