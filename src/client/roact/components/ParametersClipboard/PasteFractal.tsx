import Roact from "@rbxts/roact";
import { HttpService } from "@rbxts/services";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { clientStore } from "client/rodux/store";
import { FractalParameters } from "shared/types/FractalParameters";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";
import { Flamework } from "@flamework/core";

const isPartialParameters = Flamework.createGuard<Partial<FractalParameters>>();

interface PasteFractalProps {}

export class PasteFractal extends Roact.Component<PasteFractalProps> {
	render() {
		const onPaste = (rbx: TextBox) => {
			const text = rbx.Text;

			if (text !== "") {
				const [success, response] = pcall(() => HttpService.JSONDecode(rbx.Text));
				const hasCorrectFormat = success && isPartialParameters(response);

				if (!hasCorrectFormat) {
					rbx.Text = "Incorrect Format";
					return;
				}

				clientStore.dispatch({ type: "setParameters", parameters: response as FractalParameters });
			}

			rbx.Text = "";
		};

		return (
			<frame
				Key="PasteFractal"
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				Position={new UDim2(0.6, 0, 0.9, 0)}
				Size={new UDim2(0.2, 0, 0.05, 0)}
			>
				<CornerAndPadding
					paddingOverride={{
						PaddingLeft: new UDim(0.05, 0),
						PaddingRight: new UDim(0.05, 0),
					}}
				/>

				<textlabel
					Key="OverheadLabel"
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Position={new UDim2(0, 0, -1.3, 0)}
					Size={new UDim2(1, 0, 1, 0)}
					Text="Paste"
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
						Event={{
							FocusLost: onPaste,
						}}
						Active={false}
						BackgroundTransparency={1}
						ClearTextOnFocus={true}
						Font={Enum.Font.Ubuntu}
						Position={new UDim2(0.1, 0, 0.1, 0)}
						Selectable={false}
						Size={new UDim2(0.8, 0, 0.8, 0)}
						MultiLine={false}
						Text=""
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextEditable={true}
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
