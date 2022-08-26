
var menus = {
	"&File": [
		{
			item: "&New",
			shortcut: "Ctrl+N",
			action: file_new,
			description: "Creates a new sound.",
		},
		{
			item: "&Open",
			shortcut: "Ctrl+O",
			action: file_open,
			description: "Opens an existing sound.",
		},
		{
			item: "&Save",
			shortcut: "Ctrl+S",
			action: file_save,
			description: "Saves the active sound.",
		},
		{
			item: "Save &As",
			shortcut: "Ctrl+Shift+S",
			action: file_save_as,
			description: "Saves the active sound with a new name.",
		},
		{
			item: "&Revert...",
			enabled: can_revert_file,
			action: file_revert,
			description: "Reverts changes to the file.",
		},
		{
			item: "&Properties",
			enabled: function () { },
			action: function () { },
			description: "Shows properties for this sound file.",
		},
		MENU_DIVIDER,
		{
			item: "E&xit",
			shortcut: "Alt+F4",
			action: function () {
				close();
			},
			description: "Quits Sound Recorder.",
		}
	],
	"&Edit": [
		/*
		{
			item: "&Undo",
			shortcut: "Ctrl+Z",
			enabled: function(){
				return undos.length >= 1;
			},
			action: undo,
			description: "Undoes the last action.",
		},
		{
			item: "&Repeat",
			shortcut: "F4",
			enabled: function(){
				return redos.length >= 1;
			},
			action: redo,
			description: "Redoes the previously undone action.",
		},
		MENU_DIVIDER,*/
		{
			item: "&Copy",
			shortcut: "Ctrl+C",
			enabled: function () {
				return (typeof chrome !== "undefined") && chrome.permissions;
			},
			action: function () {
				document.execCommand("copy");
			},
			description: "Copies something to the Clipboard",
		},
		{
			item: "&Paste Insert",
			shortcut: "Ctrl+V",
			enabled: function () {
				return (typeof chrome !== "undefined") && chrome.permissions;
			},
			action: function () {
				document.execCommand("paste");
			},
			description: "Inserts the contents of the Clipboard into the sound.",
		},
		{
			item: "Paste Mi&x",
			enabled: function () {
				return (typeof chrome !== "undefined") && chrome.permissions;
			},
			action: function () {
				document.execCommand("paste");
			},
			description: "Mixes the contents of the Clipboard into the sound.",
		},
		MENU_DIVIDER,
		{
			item: "&Insert File...",
			action: function () { },
			description: "Inserts a file into the sound.",
		},
		{
			item: "&Mix with File",
			action: function () { },
			description: "Mixes a file into the sound.",
		},
		MENU_DIVIDER,
		{
			item: "Delete &Before Current Position",
			enabled: can_delete_before_current_position,
			action: delete_before_current_position,
			description: "Deletes all audio before the current position.",
		},
		{
			item: "Delete &After Current Position",
			enabled: can_delete_after_current_position,
			action: delete_after_current_position,
			description: "Deletes all audio after the current position.",
		},
		MENU_DIVIDER,
		{
			item: "A&udio Properties",
			action: function () { },
			description: "Changes microphone and speaker settings.",
		},
	],
	"Effect&s": [
		{
			item: "&Increase Volume (by 25%)",
			action: effects_increase_volume,
			description: "Increases the volume of the sound by 25%.",
		},
		{
			item: "&Decrease Volume",
			action: effects_decrease_volume,
			description: "Decreases the volume of the sound (by 25%?)",
		},
		MENU_DIVIDER,
		{
			item: "I&ncrease Speed (by 100%)",
			action: effects_increase_speed,
			description: "Makes the sound all squeaky and fast.",
		},
		{
			item: "D&ecrease Speed",
			action: effects_decrease_speed,
			description: "Makes your voice sound really deep and slow.",
		},
		MENU_DIVIDER,
		{
			item: "&Add echo",
			action: effects_add_echo,
			description: "Adds an echo to the sound.",
		},
		{
			item: "&Reverse",
			action: effects_reverse,
			description: "Reverses the sound.",
		},
	],
	"&Help": [
		{
			item: "&Help Topics",
			action: function () {
				var show_help = window.show_help;
				try {
					show_help = parent.show_help;
				} catch (e) { }
				if (show_help === undefined) {
					return alert("Help Topics only works when inside of the 98.js.org desktop.");
				}
				show_help({
					title: "Sound Recorder Help",
					contentsFile: "help/sound-recorder-help/soundrec.hhc",
					root: "help/sound-recorder-help",
				});
			},
			description: "Displays Help for the current task or command.",
		},
		MENU_DIVIDER,
		{
			item: "&About Sound Recorder",
			action: function () {
				window.open("https://github.com/1j01/98/tree/master/programs/sound-recorder");
			},
			description: "Displays information about this application."
		}
	],
};

var go_outside_frame = false;
if (frameElement) {
	try {
		if (parent.MenuBar) {
			MenuBar = parent.MenuBar;
			go_outside_frame = true;
		}
	} catch (e) { }
}
var menu_bar = MenuBar(menus);
if (go_outside_frame) {
	$(menu_bar.element).insertBefore(frameElement);
} else {
	$(menu_bar.element).prependTo(".sound-recorder");
}
