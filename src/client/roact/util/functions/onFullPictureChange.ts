import { InterfaceMode } from "client/enums/InterfaceMode";

export function onFullPictureChange(
	currentInterfaceMode: InterfaceMode,
	previousInterfaceMode: InterfaceMode,
	entered: () => void,
	exited: () => void,
) {
	const nowInFull = currentInterfaceMode === InterfaceMode.FullPicture;
	const wasInFull = previousInterfaceMode === InterfaceMode.FullPicture;

	if (nowInFull && !wasInFull) {
		entered();
	} else if (!nowInFull && wasInFull) {
		exited();
	}
}
