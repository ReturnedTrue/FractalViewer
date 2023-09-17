import Roact from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import {
	FractalParameterNameForType,
	FractalParameterValueForType,
	FractalParameters,
} from "client/rodux/reducers/fractal";
import { NumberParameter } from "./NumberParameter";
import { StringParameter } from "./StringParameter";
import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";

export interface CoreParameterProps<T> {
	name: FractalParameterNameForType<T>;
	currentValue: FractalParameterValueForType<T>;

	playerFacingName: string;
}

function enumToArray<V>(enumGiven: Record<string, V>) {
	const arr = [];

	for (const [_, value] of pairs(enumGiven)) {
		arr.push(value);
	}

	return arr;
}

interface ParametersEditorProps {
	parameters: FractalParameters;
}

class BaseParametersEditor extends Roact.Component<ParametersEditorProps> {
	private fractalOptions = enumToArray(FractalId);
	private newtonFunctionOptions = enumToArray(NewtonFunction);

	render() {
		const { parameters: params } = this.props;
		const isCurrentlyFractal = (fractal: FractalId) => params.fractalId === fractal;

		return (
			<Roact.Fragment>
				<NumberParameter
					position={UDim2.fromScale(0.05, 0.1)}
					name="xOffset"
					currentValue={params.xOffset}
					playerFacingName="X Offset"
				/>

				<NumberParameter
					position={UDim2.fromScale(0.05, 0.2)}
					name="yOffset"
					currentValue={params.yOffset}
					playerFacingName="Y Offset"
				/>

				<NumberParameter
					position={UDim2.fromScale(0.05, 0.3)}
					name="magnification"
					currentValue={params.magnification}
					playerFacingName="Magnification"
					newValueConstraint={(value) => math.max(value, 1)}
				/>

				<StringParameter
					position={UDim2.fromScale(0.05, 0.4)}
					name="fractalId"
					currentValue={params.fractalId}
					playerFacingName="Fractal"
					options={this.fractalOptions}
				/>

				{isCurrentlyFractal(FractalId.Julia) && (
					<Roact.Fragment>
						<NumberParameter
							position={UDim2.fromScale(0.05, 0.5)}
							name="juliaRealConstant"
							currentValue={params.juliaRealConstant}
							playerFacingName="Julia Real"
						/>

						<NumberParameter
							position={UDim2.fromScale(0.05, 0.6)}
							name="juliaImaginaryConstant"
							currentValue={params.juliaImaginaryConstant}
							playerFacingName="Julia Imaginary"
						/>
					</Roact.Fragment>
				)}

				{isCurrentlyFractal(FractalId.Newton) && (
					<Roact.Fragment>
						<StringParameter
							position={UDim2.fromScale(0.05, 0.5)}
							name="newtonFunction"
							currentValue={params.newtonFunction}
							playerFacingName="Function"
							options={this.newtonFunctionOptions}
						/>
					</Roact.Fragment>
				)}
			</Roact.Fragment>
		);
	}
}

export const ParametersEditor = connectComponent(BaseParametersEditor, (state) => {
	return {
		parameters: state.fractal.parameters,
	};
});
