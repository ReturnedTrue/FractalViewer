import Roact from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { CopyFractal } from "./CopyFractal";
import { PasteFractal } from "./PasteFractal";
import { FractalParameters } from "shared/types/FractalParameters";
import { InterfaceMode } from "client/enums/InterfaceMode";
import { TweenableNumberBinding } from "client/roact/util/classes/TweenableNumberBinding";
import { onFullPictureChange } from "client/roact/util/functions/onFullPictureChange";

interface ParametersClipboardProps {
	parameters: FractalParameters;
	interfaceMode: InterfaceMode;
}

class BaseParametersClipboard extends Roact.Component<ParametersClipboardProps> {
	private clipboardPosition = new TweenableNumberBinding(0, { time: 0.5 });

	render() {
		if (this.props.interfaceMode === InterfaceMode.Hidden) return;

		return (
			<frame
				Key="ParametersClipboard"
				BackgroundTransparency={1}
				Position={this.clipboardPosition.binding.map((value) => UDim2.fromScale(0, value))}
				Size={UDim2.fromScale(1, 1)}
			>
				<CopyFractal parameters={this.props.parameters} />
				<PasteFractal />
			</frame>
		);
	}

	didUpdate(previousProps: ParametersClipboardProps) {
		onFullPictureChange(
			this.props.interfaceMode,
			previousProps.interfaceMode,
			() => this.clipboardPosition.tween(1),
			() => this.clipboardPosition.tween(0),
		);
	}
}

export const ParametersClipboard = connectComponent(BaseParametersClipboard, (state) => {
	return {
		parameters: state.fractal.parameters,
		interfaceMode: state.fractal.interfaceMode,
	};
});
