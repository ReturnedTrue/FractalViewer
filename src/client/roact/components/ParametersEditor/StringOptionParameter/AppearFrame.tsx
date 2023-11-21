import Roact from "@rbxts/roact";
import { PixelScrollingFrame } from "client/roact/util/components/PixelScrollingFrame";
import { FractalParameterValueForType } from "shared/types/FractalParameters";
import { OptionFrame } from "./OptionFrame";

interface AppearFrameProps {
	optionSize: UDim2;

	currentValue: FractalParameterValueForType<string>;
	onNewValue: (value: string) => void;

	options: Array<FractalParameterValueForType<string>>;
	appearOnRight: boolean;
}

export class AppearFrame extends Roact.Component<AppearFrameProps> {
	render() {
		const offsetYSize = this.props.optionSize.Y.Offset;

		return (
			<frame
				Key="AppearFrame"
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				ClipsDescendants={true}
				Position={new UDim2(this.props.appearOnRight ? 1.1 : -0.7, 0, 0, 0)}
				Size={new UDim2(0.6, 0, 2, 0)}
			>
				<uicorner />

				<PixelScrollingFrame
					Key="InnerFrame"
					pixelsPerScroll={offsetYSize * 1.2}
					tweenData={{
						time: 0.25,
					}}
					scrollingFrameProps={{
						BackgroundTransparency: 1,
						CanvasSize: new UDim2(0, 0, 0, (this.props.options.size() - 1) * (offsetYSize * (4 / 3))),
						ClipsDescendants: false,
						Position: new UDim2(0.1, 0, 0.1, 0),
						ScrollBarThickness: 0,
						Selectable: false,
						SelectionGroup: false,
						Size: new UDim2(0.8, 0, 0.8, 0),
					}}
				>
					<uigridlayout
						CellPadding={new UDim2(0, 0, 0, offsetYSize / 3)}
						CellSize={this.props.optionSize}
						FillDirectionMaxCells={1}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					{this.props.options.mapFiltered((option) => {
						if (option === this.props.currentValue) return;

						return <OptionFrame optionValue={option} onSelected={this.props.onNewValue} />;
					})}
				</PixelScrollingFrame>
			</frame>
		);
	}
}
