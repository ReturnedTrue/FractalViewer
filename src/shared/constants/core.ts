export const VERBOSE_DEBUG_MODE = false;

export const withVerboseModeOn = (func: () => void) => {
	if (VERBOSE_DEBUG_MODE) {
		func();
	}
};
