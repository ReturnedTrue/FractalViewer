import RoactRodux, { StatefulComponent, ConnectedComponent } from "@rbxts/roact-rodux";
import { ComponentType } from "@rbxts/roact-rodux";
import { CombinedState } from "client/rodux/store";

export function connectComponent<P, R extends Partial<P>>(
	component: StatefulComponent<P>,
	mapStateToProps: (state: CombinedState) => R,
) {
	return RoactRodux.connect(mapStateToProps)(component as never) as ConnectedComponent<ComponentType<P>, R>;
}
