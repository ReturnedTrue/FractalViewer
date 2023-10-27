import { InterfaceMode } from "shared/enums/InterfaceMode";

export function propsInFullPicture(props: { interfaceMode: InterfaceMode }) {
	return props.interfaceMode === InterfaceMode.FullPicture;
}
