﻿import {ContentView as ContentViewDefinition} from "ui/content-view";
import {View, CustomLayoutView, AddChildFromBuilder} from "ui/core/view";
import * as utils from "utils/utils";

export class ContentView extends CustomLayoutView implements ContentViewDefinition, AddChildFromBuilder {
    private _content: View;

    get content(): View {
        return this._content;
    }
    set content(value: View) {
        let oldView = this._content;
        if (this._content) {
            this._removeView(this._content);
        }

        this._content = value;

        if (this._content) {
            this._addView(this._content);
        }

        this._onContentChanged(oldView, value);
    }

    get layoutView(): View {
        let result: View;

        if (this._content) {
            let first = true;
            this._content._eachLayoutView((child) => {
                if (first) {
                    first = false;
                    result = child;
                } else {
                    throw new Error("More than one layout child inside a ContentView");
                }
            });
        }

        return result;
    }

    get _childrenCount(): number {
        if (this._content) {
            return 1;
        }

        return 0;
    }

    public _onContentChanged(oldView: View, newView: View) {
        //
    }

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof View) {
            this.content = value;
        }
    }

    public _eachChildView(callback: (child: View) => boolean) {
        if (this._content) {
            callback(this._content);
        }
    }

    // This method won't be called in Android because we use the native android layout.
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        View.adjustChildLayoutParams(this.layoutView, widthMeasureSpec, heightMeasureSpec);

        let result = View.measureChild(this, this.layoutView, widthMeasureSpec, heightMeasureSpec);

        let width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        let height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        let density = utils.layout.getDisplayDensity();
        let measureWidth = Math.max(result.measuredWidth, this.minWidth * density);
        let measureHeight = Math.max(result.measuredHeight, this.minHeight * density);

        let widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        let heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    // This method won't be called in Android because we use the native android layout.
    public onLayout(left: number, top: number, right: number, bottom: number): void {
        View.layoutChild(this, this.layoutView, 0, 0, right - left, bottom - top);

        View.restoreChildOriginalParams(this.layoutView);
    }
}