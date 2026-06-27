package com.fangwendong.aigf;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WebView webView = new WebView(this);
    webView.getSettings().setJavaScriptEnabled(true);
    webView.getSettings().setDomStorageEnabled(true);
    webView.getSettings().setAllowContentAccess(true);
    webView.getSettings().setAllowFileAccess(true);
    webView.getSettings().setAllowFileAccessFromFileURLs(true);
    webView.getSettings().setAllowUniversalAccessFromFileURLs(true);

    WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
      .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
      .build();

    webView.setWebViewClient(new WebViewClient() {
      @Override
      public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        return false;
      }

      @Override
      public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri uri = request.getUrl();
        if (uri != null && "appassets.androidplatform.net".equals(uri.getHost())) {
          return assetLoader.shouldInterceptRequest(uri);
        }
        return super.shouldInterceptRequest(view, request);
      }
    });

    webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html");
    setContentView(webView);
  }
}
