import Roact, { createElement } from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { NumberParameter } from "./NumberParameter";
import { StringParameter } from "./StringParameter";
import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";
import {
	FractalParameterName,
	FractalParameterNameForType,
	FractalParameterValueForType,
	FractalParameters,
} from "shared/types/FractalParameters";
import { clientStore } from "client/rodux/store";
import { BooleanParameter } from "./BooleanParameter";

export interface CoreParameterProps<T> {
	playerFacingName: string;
	order: number;

	currentValue: FractalParameterValueForType<T>;
	onNewValue: (value: T) => void;
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
		const { parameters } = this.props;

		function isCurrentlyFractal(fractal: FractalId) {
			return parameters.fractalId === fractal;
		}

		function createParameter<P>(
			parameterComponent: Roact.ComponentConstructor<P>,
			name: FractalParameterNameForType<P extends CoreParameterProps<infer T> ? T : never>,
			props: P extends CoreParameterProps<infer T> ? Omit<P, "currentValue" | "onNewValue"> : never,
		) {
			return createElement(parameterComponent, {
				currentValue: parameters[name],
				onNewValue: (value: never) => clientStore.dispatch({ type: "updateParameter", name, value }),

				...props,
			} as never);
		}

		return (
			<frame Key="ParametersEditor" BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
				<uilistlayout
					Padding={new UDim(0.05, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					FillDirection={Enum.FillDirection.Vertical}
					VerticalAlignment={Enum.VerticalAlignment.Top}
				/>

				<uipadding PaddingLeft={new UDim(0.08, 0)} PaddingTop={new UDim(0.1, 0)} />

				{createParameter(NumberParameter, "xOffset", { order: 1, playerFacingName: "X Offset" })}
				{createParameter(NumberParameter, "yOffset", { order: 2, playerFacingName: "Y Offset" })}

				{createParameter(NumberParameter, "magnification", {
					order: 3,
					playerFacingName: "Magnification",
					newValueConstraint: (value) => math.max(value, 1),
				})}

				{createParameter(NumberParameter, "hueShift", {
					order: 4,
					playerFacingName: "Hue Shift",
					newValueConstraint: (value) => math.clamp(value, 0, 360),
				})}

				{createParameter(StringParameter, "fractalId", {
					order: 5,
					playerFacingName: "Fractal",
					options: this.fractalOptions,
				})}

				{isCurrentlyFractal(FractalId.Julia) && (
					<Roact.Fragment>
						{createParameter(NumberParameter, "juliaRealConstant", {
							order: 100,
							playerFacingName: "Julia Real",
						})}

						{createParameter(NumberParameter, "juliaImaginaryConstant", {
							order: 101,
							playerFacingName: "Julia Imaginary",
						})}
					</Roact.Fragment>
				)}

				{isCurrentlyFractal(FractalId.Newton) && (
					<Roact.Fragment>
						{createParameter(StringParameter, "newtonFunction", {
							order: 100,
							playerFacingName: "Function",
							options: this.newtonFunctionOptions,
						})}

						{createParameter(BooleanParameter, "newtonPreferRootBasisHue", {
							order: 101,
							playerFacingName: "Prefer Per Root Basis Colors",
						})}

						{createParameter(NumberParameter, "newtonCoefficientReal", {
							order: 102,
							playerFacingName: "Coefficient Real",
						})}

						{createParameter(NumberParameter, "newtonCoefficientImaginary", {
							order: 103,
							playerFacingName: "Coefficient Imaginary",
						})}
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
