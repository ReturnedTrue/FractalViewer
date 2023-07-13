import RoactRodux from "@rbxts/roact-rodux";
import { ComponentType } from "@rbxts/roact-rodux";
import { CombinedState } from "client/rodux/store";

export function connectComponent<P = {}>(component: ComponentType<P>, mapStateToProps: (state: CombinedState) => P) {
	return RoactRodux.connect(mapStateToProps)(component);
}
