"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Globe,
  ExternalLink,
  RefreshCw,
  Home,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function XemWebPage() {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    document.title = "Xem Web - Dashboard";
  }, []);

  const handleLoadUrl = () => {
    if (!url) return;

    let formattedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      formattedUrl = "https://" + url;
    }

    setIsLoading(true);
    setLoadError(false);
    setIframeLoaded(false);
    setCurrentUrl(formattedUrl);

    // Set timeout to detect loading issues
    setTimeout(() => {
      if (!iframeLoaded) {
        setLoadError(true);
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout
  };

  const handleRefresh = () => {
    if (currentUrl) {
      setIsLoading(true);
      setLoadError(false);
      setIframeLoaded(false);
      // Force refresh iframe
      const iframe = document.getElementById("web-iframe") as HTMLIFrameElement;
      if (iframe) {
        iframe.src = currentUrl;
      }
      setTimeout(() => {
        if (!iframeLoaded) {
          setLoadError(true);
          setIsLoading(false);
        }
      }, 10000);
    }
  };

  const handleReset = () => {
    setUrl("");
    setCurrentUrl("");
    setLoadError(false);
    setIframeLoaded(false);
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIsLoading(false);
    setLoadError(false);
  };

  const handleIframeError = () => {
    setLoadError(true);
    setIsLoading(false);
    setIframeLoaded(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLoadUrl();
    }
  };

  const quickLinks = [
    { name: "Wikipedia", url: "https://vi.wikipedia.org" },
    { name: "VNExpress", url: "https://vnexpress.net" },
    { name: "Dân Trí", url: "https://dantri.com.vn" },
    { name: "Example.com", url: "https://example.com" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Xem Web</h1>
        <p className="text-gray-600">
          Nhập link để xem website ngay trên trang quản lý
        </p>
      </div>

      {/* URL Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Nhập địa chỉ website
          </CardTitle>
          <CardDescription>
            Nhập URL của trang web bạn muốn xem (VD: google.com, facebook.com)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nhập URL (VD: google.com hoặc https://google.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleLoadUrl} disabled={!url || isLoading}>
              <Globe className="h-4 w-4 mr-2" />
              Tải trang
            </Button>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Truy cập nhanh:</p>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Button
                  key={link.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUrl(link.url);
                    setCurrentUrl(link.url);
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          {currentUrl && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {currentUrl}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(currentUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert - CSP/X-Frame-Options Violation */}
      {currentUrl && loadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>❌ Không thể tải trang web trong iframe</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Trang web <strong className="break-all">{currentUrl}</strong> đã
              chặn việc hiển thị trong iframe.
            </p>

            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm space-y-2">
              <p className="font-semibold text-red-900">🔒 Lý do bảo mật:</p>
              <ul className="list-disc list-inside space-y-1 text-red-800">
                <li>
                  <strong>X-Frame-Options</strong>: Ngăn chặn clickjacking
                </li>
                <li>
                  <strong>Content Security Policy (CSP)</strong>: Giới hạn nguồn
                  nhúng
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              <p className="font-semibold text-yellow-900 mb-1">
                🚫 Các trang web thường bị chặn:
              </p>
              <p className="text-yellow-800">
                Google, YouTube, Facebook, Instagram, Twitter, Banking apps,
                AppSheet, Gmail, LinkedIn, và hầu hết các trang đăng nhập/thanh
                toán.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
              <p className="font-semibold text-green-900 mb-1">
                ✅ Các trang có thể dùng:
              </p>
              <p className="text-green-800">
                Wikipedia, các trang tin tức (VNExpress, Dân Trí), blog cá nhân,
                tài liệu công khai, và các trang cho phép nhúng.
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(currentUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Mở trong tab mới
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <Home className="h-4 w-4 mr-2" />
                Thử trang khác
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Indicator */}
      {currentUrl && iframeLoaded && !loadError && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Đã tải thành công</AlertTitle>
          <AlertDescription className="text-green-800">
            Trang web đang hiển thị bên dưới. Bạn có thể tương tác trực tiếp với
            trang web.
          </AlertDescription>
        </Alert>
      )}

      {/* Iframe Display */}
      {currentUrl && !loadError && (
        <Card>
          <CardContent className="p-0">
            <div
              className="relative w-full"
              style={{ height: "calc(100vh - 500px)", minHeight: "600px" }}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Đang tải trang...</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Nếu không tải được sau 10 giây, trang web có thể chặn
                      iframe
                    </p>
                  </div>
                </div>
              )}
              <iframe
                id="web-iframe"
                src={currentUrl}
                className="w-full h-full border-0 rounded-lg"
                title="Web Viewer"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!currentUrl && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <Globe className="h-16 w-16 mx-auto text-gray-300" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Chưa có trang web nào được tải
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Nhập địa chỉ website ở trên hoặc chọn một liên kết nhanh để
                  bắt đầu
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
