  Unfortunately, Google hasn't done the leg work to make the Chrome Recovery Utility work on Linux. You can use *dd* to write an OS image to a drive.
This will work with .bin, .img, .raw, and .iso files.

0) Unzip the ThoriumOS .7z - it has to be just .bin
 --- you may need to install a utility like 7zip to handle this file.
 
1) Get your USB stick plugged in, and remove ALL OTHER removable media.

2) Open a terminal.

3) Run "sudo fdisk -l" and inspect the output; You should see your hard drive and the USB stick listed as /dev/sda and /dev/sdb (if not, proceed very carefully and see the IDs of which drive is which.

4) If the USB is definitely sdb, you can use 'cd' to go to the same folder as where thoriumos_image.bin is and run this:

`sudo dd if=thoriumos_image.bin of=/dev/sdx bs=4M oflag=sync status=progress`

Where "/dev/sdx" is the ID of your usb drive, I.E. /dev/sdb BUT ONLY AS LONG AS YOU ARE SURE THE USB IS SDB.

A lot of emphasis here, because whatever device is there will be completely erased.

Once the operation finishes you have the same installer the Chrome Recovery Tool or cros_flash would have made.
