import Roact from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { CopyFractal } from "./CopyFractal";
import { PasteFractal } from "./PasteFractal";
import { FractalParameters } from "shared/types/FractalParameters";
import { InterfaceMode } from "shared/enums/InterfaceMode";
import { TweenableBinding } from "client/roact/util/classes/TweenableBinding";
import { propsInFullPicture } from "client/roact/util/functions/propsInFullPicture";

interface ParametersClipboardProps {
	parameters: FractalParameters;
	interfaceMode: InterfaceMode;
}

class BaseParametersClipboard extends Roact.Component<ParametersClipboardProps> {
	private clipboardPosition = new TweenableBinding(0, { Time: 0.2 });

	render() {
		const { parameters, interfaceMode } = this.props;
		if (interfaceMode === InterfaceMode.Hidden) return;

		return (
			<frame
				Key="ParametersClipboard"
				BackgroundTransparency={1}
				Position={this.clipboardPosition.binding.map((value) => UDim2.fromScale(0, value))}
				Size={UDim2.fromScale(1, 1)}
			>
				<CopyFractal parameters={parameters} />
				<PasteFractal />
			</frame>
		);
	}

	didUpdate(previousProps: ParametersClipboardProps) {
		const nowInFull = this.props.interfaceMode === InterfaceMode.FullPicture;
		const wasInFull = previousProps.interfaceMode === InterfaceMode.FullPicture;

		if (nowInFull && !wasInFull) {
			this.clipboardPosition.tween(1);
		} else if (!nowInFull && wasInFull) {
			this.clipboardPosition.tween(0);
		}
	}
}

export const ParametersClipboard = connectComponent(BaseParametersClipboard, (state) => {
	return {
		parameters: state.fractal.parameters,
		interfaceMode: state.fractal.interfaceMode,
	};
});
