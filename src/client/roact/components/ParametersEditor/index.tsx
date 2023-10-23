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
	visible: boolean;
}

class BaseParametersEditor extends Roact.Component<ParametersEditorProps> {
	private fractalOptions = enumToArray(FractalId);
	private newtonFunctionOptions = enumToArray(NewtonFunction);

	render() {
		const { parameters, visible } = this.props;
		if (!visible) return;

		function isCurrentlyFractal(fractal: FractalId) {
			return parameters.fractalId === fractal;
		}

		function createParameter<P>(
			parameterComponent: Roact.ComponentConstructor<P>,
			name: FractalParameterNameForType<P extends CoreParameterProps<infer T> ? T : never>,
			props: P extends CoreParameterProps<infer _T> ? Omit<P, "currentValue" | "onNewValue"> : never,
		) {
			return createElement(parameterComponent, {
				currentValue: parameters[name],
				onNewValue: (value: never) => clientStore.dispatch({ type: "updateParameter", name, value }),

				...props,
			} as never);
		}

		return (
			<Roact.Fragment>
				<frame
					Key="LeftHandParametersEditor"
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.025, 0.05)}
					Size={UDim2.fromScale(1, 1)}
				>
					<uilistlayout
						Padding={new UDim(0.025, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						FillDirection={Enum.FillDirection.Vertical}
						VerticalAlignment={Enum.VerticalAlignment.Top}
					/>

					{createParameter(StringParameter, "fractalId", {
						order: 1,
						playerFacingName: "Fractal",
						options: this.fractalOptions,
						appearOnRight: true,
					})}

					{createParameter(NumberParameter, "axisSize", {
						order: 2,
						playerFacingName: "Axis Size",
					})}

					{createParameter(NumberParameter, "maxIterations", {
						order: 3,
						playerFacingName: "Max Iterations",
					})}

					{createParameter(NumberParameter, "xOffset", { order: 4, playerFacingName: "X Offset" })}
					{createParameter(NumberParameter, "yOffset", { order: 5, playerFacingName: "Y Offset" })}

					{createParameter(NumberParameter, "magnification", {
						order: 6,
						playerFacingName: "Magnification",
						newValueConstraint: (value) => math.max(value, 1),
					})}

					{createParameter(NumberParameter, "hueShift", {
						order: 7,
						playerFacingName: "Hue Shift",
						newValueConstraint: (value) => math.clamp(value, 0, 360),
					})}
				</frame>

				<frame
					Key="RightHandParametersEditor"
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.775, 0.175)}
					Size={UDim2.fromScale(1, 1)}
				>
					<uilistlayout
						Padding={new UDim(0.025, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						FillDirection={Enum.FillDirection.Vertical}
						VerticalAlignment={Enum.VerticalAlignment.Top}
					/>

					{isCurrentlyFractal(FractalId.Julia) && (
						<Roact.Fragment>
							{createParameter(NumberParameter, "juliaRealConstant", {
								order: 1,
								playerFacingName: "Julia Real",
							})}

							{createParameter(NumberParameter, "juliaImaginaryConstant", {
								order: 2,
								playerFacingName: "Julia Imaginary",
							})}
						</Roact.Fragment>
					)}

					{isCurrentlyFractal(FractalId.Newton) && (
						<Roact.Fragment>
							{createParameter(StringParameter, "newtonFunction", {
								order: 1,
								playerFacingName: "Function",
								options: this.newtonFunctionOptions,
								appearOnRight: false,
							})}

							{createParameter(BooleanParameter, "newtonPreferRootBasisHue", {
								order: 2,
								playerFacingName: "Prefer Per Root Basis Colors",
							})}

							{createParameter(NumberParameter, "newtonCoefficientReal", {
								order: 3,
								playerFacingName: "Coefficient Real",
							})}

							{createParameter(NumberParameter, "newtonCoefficientImaginary", {
								order: 4,
								playerFacingName: "Coefficient Imaginary",
							})}
						</Roact.Fragment>
					)}
				</frame>
			</Roact.Fragment>
		);
	}
}

export const ParametersEditor = connectComponent(BaseParametersEditor, (state) => {
	return {
		parameters: state.fractal.parameters,
		visible: state.fractal.partsFolder !== undefined,
	};
});
