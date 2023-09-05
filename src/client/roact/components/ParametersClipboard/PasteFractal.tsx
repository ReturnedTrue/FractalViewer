import { $terrify } from "rbxts-transformer-t";
import Roact from "@rbxts/roact";
import { HttpService } from "@rbxts/services";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { FractalParameters } from "client/rodux/reducers/fractal";
import { clientStore } from "client/rodux/store";

const isParameters = $terrify<Partial<FractalParameters>>();

interface PasteFractalProps {}

export class PasteFractal extends Roact.Component<PasteFractalProps> {
	render() {
		const onPaste = (rbx: TextBox) => {
			const text = rbx.Text;

			if (text !== "") {
				const [success, response] = pcall(() => HttpService.JSONDecode(rbx.Text));
				const hasCorrectFormat = success && isParameters(response);

				if (!hasCorrectFormat) {
					rbx.Text = "Incorrect Format";
					return;
				}

				clientStore.dispatch({ type: "updateParameters", parameters: response as FractalParameters });
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
