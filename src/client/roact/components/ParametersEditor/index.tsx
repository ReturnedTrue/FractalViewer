import Roact from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { NumberParameter } from "./NumberParameter";
import { StringParameter } from "./StringParameter";
import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";
import {
	FractalParameterNameForType,
	FractalParameterValueForType,
	FractalParameters,
} from "shared/types/FractalParameters";

export interface CoreParameterProps<T> {
	name: FractalParameterNameForType<T>;
	order: number;
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
			<frame Key="ParametersEditor" BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
				<uilistlayout
					Padding={new UDim(0.05, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					FillDirection={Enum.FillDirection.Vertical}
					VerticalAlignment={Enum.VerticalAlignment.Top}
				/>

				<uipadding PaddingLeft={new UDim(0.08, 0)} PaddingTop={new UDim(0.1, 0)} />

				<NumberParameter name="xOffset" order={1} currentValue={params.xOffset} playerFacingName="X Offset" />
				<NumberParameter name="yOffset" order={2} currentValue={params.yOffset} playerFacingName="Y Offset" />

				<NumberParameter
					name="magnification"
					order={3}
					currentValue={params.magnification}
					playerFacingName="Magnification"
					newValueConstraint={(value) => math.max(value, 1)}
				/>

				<NumberParameter
					name="hueShift"
					order={4}
					currentValue={params.hueShift}
					playerFacingName="Hue Shift"
					newValueConstraint={(value) => math.clamp(value, 0, 360)}
				/>

				<StringParameter
					name="fractalId"
					order={5}
					currentValue={params.fractalId}
					playerFacingName="Fractal"
					options={this.fractalOptions}
				/>

				{isCurrentlyFractal(FractalId.Julia) && (
					<Roact.Fragment>
						<NumberParameter
							name="juliaRealConstant"
							order={100}
							currentValue={params.juliaRealConstant}
							playerFacingName="Julia Real"
						/>

						<NumberParameter
							name="juliaImaginaryConstant"
							order={101}
							currentValue={params.juliaImaginaryConstant}
							playerFacingName="Julia Imaginary"
						/>
					</Roact.Fragment>
				)}

				{isCurrentlyFractal(FractalId.Newton) && (
					<Roact.Fragment>
						<StringParameter
							name="newtonFunction"
							order={100}
							currentValue={params.newtonFunction}
							playerFacingName="Function"
							options={this.newtonFunctionOptions}
						/>

						<NumberParameter
							name="newtonCoefficient"
							order={101}
							currentValue={params.newtonCoefficient}
							playerFacingName="Coefficient"
						/>
					</Roact.Fragment>
				)}
			</frame>
		);
	}
}

export const ParametersEditor = connectComponent(BaseParametersEditor, (state) => {
	return {
		parameters: state.fractal.parameters,
	};
});
