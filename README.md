# Samsung Multiroom

Control Samsung multiroom speakers and soundbars

## sources

https://sites.google.com/site/moosyresearch/projects/samsung_shape

https://github.com/DaveGut/SmartThings_Samsung-WiFi-Audio-Unofficial/blob/master/0%20-%20DeviceHandler/Samsung%20WiFi%20Audio%20DH-V4.groovy

https://github.com/DaveGut/SmartThings_Samsung-WiFi-Audio-Unofficial/blob/master/1%20-%20ServiceManager/Samsung%20WiFi%20Audio%20SM%20V4.groovy

https://developer.samsung.com/tv/develop/extension-libraries/smart-view-sdk/sender-apps/javascript-sender-app/
https://github.com/SamsungDForum/SmartViewSDKHelloWorld


https://github.com/macbury/ha_samsung_multi_room/blob/master/media_player/samsung_multi_room.py

https://github.com/bacl/WAM_API_DOC

https://gist.github.com/fhatz/f5645682f3f1d73583035980a921f59b

http://192.168.1.250:55001/
http://192.168.1.70:55001/
http://192.168.1.25:55001/ # soundbar


{
"id": "7591IIN4RWD1J",
"name": "[AV] Soundbar",
"version": "2.0.25",
"device": {
  "type": "Samsung Speaker",
  "duid": "333",
  "model": "Linux arm",
  "modelName": "Linux arm",
  "description": "Linux arm on ARMv7 Processor rev 5 (v7l)",
  "networkType": "wireless",
  "ssid": "",
  "ip": "192.168.1.25",
  "firmwareVersion": "3.10.30",
  "name": "[AV] Soundbar",
  "id": "7591IIN4RWD1J",
  "udn": "2222",
  "resolution": "1920x1080",
  "countryCode": "US",
  "msfVersion": "2.0.25",
  "smartHubAgreement": "false"
  },
"type": "Samsung Speaker",
"uri": "http://192.168.1.25:8001/api/v2/",
"remote": "0",
"isSupport": "{\"remote_available\":\"false\",\"remote_fourDirections\":\"false\",\"remote_touchPad\":\"false\",\"remote_voiceControl\":\"false\",\"DMP_available\":\"true\",\"DMP_DRM_PLAYREADY\":\"false\",\"DMP_DRM_WIDEVINE\":\"false\"}"
}

GetSpkName
<?xml version="1.0" encoding="UTF-8"?>
<UIC>
	<method>SpkName</method>
	<version>1.0</version>
	<speakerip>192.168.1.70</speakerip>
	<user_identifier></user_identifier>
	<response result="ok">
		<spkname>
			<![CDATA[[Samsung] M7 L]]>
		</spkname>
	</response>
</UIC>
GetFunc
<?xml version="1.0" encoding="UTF-8"?>
<UIC>
	<method>CurrentFunc</method>
	<version>1.0</version>
	<speakerip>192.168.1.25</speakerip>
	<user_identifier></user_identifier>
	<response result="ok">
		<function>wifi</function>
		<submode>device</submode> // subdevice
		<connection></connection>
		<devicename>
			<![CDATA[]]>
		</devicename>
	</response>
</UIC>

GetGroupName
<?xml version="1.0" encoding="UTF-8"?>
<UIC>
	<method>GroupName</method>
	<version>1.0</version>
	<speakerip>192.168.1.250</speakerip>
	<user_identifier></user_identifier>
	<response result="ok">
		<groupname>
			<![CDATA[Soundbar]]>
		</groupname>
	</response>
</UIC>