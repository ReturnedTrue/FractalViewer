import Roact from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { FractalParameters } from "client/rodux/reducers/fractal";
import { NumberParameter } from "./NumberParameter";
import { clientStore } from "client/rodux/store";

interface ParametersEditorProps {
	parameters: FractalParameters;
}

class BaseParametersEditor extends Roact.Component<ParametersEditorProps> {
	render() {
		const { parameters } = this.props;

		return (
			<Roact.Fragment>
				<NumberParameter
					position={UDim2.fromScale(0.05, 0.1)}
					name="X Offset"
					currentValue={parameters.xOffset}
					onNewValue={(value) =>
						clientStore.dispatch({
							type: "updateParameters",
							parameters: { ...parameters, xOffset: value },
						})
					}
				/>

				<NumberParameter
					position={UDim2.fromScale(0.05, 0.2)}
					name="Y Offset"
					currentValue={parameters.yOffset}
					onNewValue={(value) =>
						clientStore.dispatch({
							type: "updateParameters",
							parameters: { ...parameters, yOffset: value },
						})
					}
				/>

				<NumberParameter
					position={UDim2.fromScale(0.05, 0.3)}
					name="Magnification"
					currentValue={parameters.magnification}
					newValueConstraint={(value) => math.max(value, 1)}
					onNewValue={(value) =>
						clientStore.dispatch({
							type: "updateParameters",
							parameters: { ...parameters, magnification: value },
						})
					}
				/>
			</Roact.Fragment>
		);
	}
}

export const ParametersEditor = connectComponent(BaseParametersEditor, (state) => {
	return {
		parameters: state.fractal.parameters,
	};
});
