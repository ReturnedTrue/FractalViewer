import Roact from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { CopyFractal } from "./CopyFractal";
import { PasteFractal } from "./PasteFractal";
import { FractalParameters } from "shared/types/FractalParameters";

interface ParametersClipboardProps {
	parameters: FractalParameters;
	visible: boolean;
}

class BaseParametersClipboard extends Roact.Component<ParametersClipboardProps> {
	render() {
		const { parameters, visible } = this.props;
		if (!visible) return;

		return (
			<Roact.Fragment>
				<CopyFractal parameters={parameters} />
				<PasteFractal />
			</Roact.Fragment>
		);
	}
}

export const ParametersClipboard = connectComponent(BaseParametersClipboard, (state) => {
	return {
		parameters: state.fractal.parameters,
		visible: state.fractal.partsFolder !== undefined,
	};
});
