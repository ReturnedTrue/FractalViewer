import Roact from "@rbxts/roact";
import { HttpService } from "@rbxts/services";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { FractalParameters } from "shared/types/FractalParameters";

interface CopyFractalProps {
	parameters: FractalParameters;
}

export class CopyFractal extends Roact.Component<CopyFractalProps> {
	render() {
		const encoded = HttpService.JSONEncode(this.props.parameters);

		return (
			<frame
				Key="CopyFractal"
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				Position={new UDim2(0.3, 0, 0.9, 0)}
				Size={new UDim2(0.2, 0, 0.05, 0)}
			>
				<uicorner />
				<uipadding
					PaddingBottom={new UDim(0.1, 0)}
					PaddingLeft={new UDim(0.05, 0)}
					PaddingRight={new UDim(0.025, 0)}
					PaddingTop={new UDim(0.1, 0)}
				/>

				<textlabel
					Key="OverheadLabel"
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Position={new UDim2(0, 0, -1.3, 0)}
					Size={new UDim2(1, 0, 1, 0)}
					Text="Copy"
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				>
					<UnifiedTextScaler />
				</textlabel>

				<frame
					Key="InnerFrame"
					BackgroundColor3={Color3.fromRGB(52, 52, 52)}
					BorderSizePixel={0}
					Size={new UDim2(1, 0, 1, 0)}
				>
					<uicorner />

					<textbox
						Key="Box"
						Active={false}
						BackgroundTransparency={1}
						ClearTextOnFocus={false}
						Font={Enum.Font.Ubuntu}
						Position={new UDim2(0.1, 0, 0.1, 0)}
						Selectable={false}
						Size={new UDim2(0.8, 0, 0.8, 0)}
						MultiLine={false}
						Text={encoded}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextEditable={false}
						TextScaled={true}
						TextWrapped={true}
					>
						<UnifiedTextScaler />
					</textbox>
				</frame>
			</frame>
		);
	}
}
