import Roact from "@rbxts/roact";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { clientStore } from "client/rodux/store";
import { PivotParameterData } from "shared/types/FractalParameters";

interface PivotDisplayProps {
	pivot: PivotParameterData;
}

class BasePivotDisplay extends Roact.Component<PivotDisplayProps> {
	render() {
		const { pivot } = this.props;

		const onClear = () => {
			if (!pivot) return;

			clientStore.dispatch({ type: "updateParameter", name: "pivot", value: false });
		};

		return (
			<frame
				Key="PivotDisplay"
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				LayoutOrder={1}
				Position={new UDim2(0.775, 0, 0.05, 0)}
				Size={new UDim2(0.2, 0, 0.1, 0)}
			>
				<uicorner />

				<textlabel
					Key="TopLabel"
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Size={new UDim2(1, 0, 0.25, 0)}
					Text="Pivot"
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				>
					<UnifiedTextScaler />
				</textlabel>

				<frame
					Key="InnerFrame"
					BackgroundTransparency={1}
					Position={new UDim2(0, 0, 0.3, 0)}
					Size={new UDim2(1, 0, 0.3, 0)}
				>
					<uigridlayout
						CellPadding={new UDim2(0.1, 0, 0, 0)}
						CellSize={new UDim2(0.4, 0, 1, 0)}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					<frame
						Key="XDisplay"
						LayoutOrder={0}
						BackgroundColor3={Color3.fromRGB(52, 52, 52)}
						BorderSizePixel={0}
						Size={new UDim2(0, 100, 0, 100)}
					>
						<CornerAndPadding />

						<textlabel
							BackgroundTransparency={1}
							Font={Enum.Font.Ubuntu}
							Size={new UDim2(1, 0, 1, 0)}
							Text={pivot ? tostring(pivot[0]) : "N/A"}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextSize={14}
							TextWrapped={true}
						>
							<UnifiedTextScaler />
						</textlabel>
					</frame>

					<frame
						Key="YDisplay"
						LayoutOrder={1}
						BackgroundColor3={Color3.fromRGB(52, 52, 52)}
						BorderSizePixel={0}
						Size={new UDim2(0, 100, 0, 100)}
					>
						<CornerAndPadding />

						<textlabel
							BackgroundTransparency={1}
							Font={Enum.Font.Ubuntu}
							Size={new UDim2(1, 0, 1, 0)}
							Text={pivot ? tostring(pivot[1]) : "N/A"}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextSize={14}
							TextWrapped={true}
						>
							<UnifiedTextScaler />
						</textlabel>
					</frame>
				</frame>

				<textbutton
					Key="ClearButton"
					Event={{
						MouseButton1Click: onClear,
					}}
					AutoButtonColor={pivot !== false}
					BackgroundColor3={pivot ? Color3.fromRGB(85, 170, 255) : Color3.fromRGB(52, 52, 52)}
					BorderSizePixel={0}
					TextTransparency={1}
					Position={new UDim2(0.275, 0, 0.7, 0)}
					Size={new UDim2(0.45, 0, 0.225, 0)}
				>
					<CornerAndPadding />

					<textlabel
						BackgroundTransparency={1}
						Font={Enum.Font.Ubuntu}
						Size={new UDim2(1, 0, 1, 0)}
						Text="Clear Pivot"
						TextColor3={pivot ? new Color3(1, 1, 1) : Color3.fromRGB(136, 136, 136)}
						TextScaled={true}
						TextSize={14}
						TextWrapped={true}
					/>
				</textbutton>
			</frame>
		);
	}
}

export const PivotDisplay = connectComponent(BasePivotDisplay, (state) => {
	return {
		pivot: state.fractal.parameters.pivot,
	};
});
