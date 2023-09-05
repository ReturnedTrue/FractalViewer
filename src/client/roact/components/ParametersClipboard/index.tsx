import Roact from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { CopyFractal } from "./CopyFractal";
import { FractalParameters } from "client/rodux/reducers/fractal";
import { PasteFractal } from "./PasteFractal";

interface ParametersClipboardProps {
	parameters: FractalParameters;
}

class BaseParametersClipboard extends Roact.Component<ParametersClipboardProps> {
	render() {
		return (
			<Roact.Fragment>
				<CopyFractal parameters={this.props.parameters} />
				<PasteFractal />
			</Roact.Fragment>
		);
	}
}

export const ParametersClipboard = connectComponent(BaseParametersClipboard, (state) => {
	return {
		parameters: state.fractal.parameters,
	};
});
